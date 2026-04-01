import {
  type AccrualPosition,
  DEFAULT_SLIPPAGE_TOLERANCE,
  type Market,
  type MarketId,
  type MarketParams,
} from "@morpho-org/blue-sdk";
import {
  fetchAccrualPosition,
  fetchHolding,
  fetchMarket,
  fetchPosition,
  fetchVault,
  fetchVaultMarketConfig,
} from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import { getBlock } from "viem/actions";
import {
  getMorphoAuthorizationRequirement,
  getRequirements,
  marketV1Borrow,
  marketV1SupplyCollateral,
  marketV1SupplyCollateralBorrow,
} from "../../actions";
import {
  computeMinBorrowSharePrice,
  computeReallocations,
  validateAccrualPosition,
  validateChainId,
  validateNativeCollateral,
  validatePositionHealth,
  validateReallocations,
} from "../../helpers";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  type DepositAmountArgs,
  type ERC20ApprovalAction,
  ExcessiveSlippageToleranceError,
  type MarketV1BorrowAction,
  type MarketV1SupplyCollateralAction,
  type MarketV1SupplyCollateralBorrowAction,
  MissingAccrualPositionError,
  type MorphoAuthorizationAction,
  type MorphoClientType,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
  NonPositiveAssetAmountError,
  NonPositiveBorrowAmountError,
  type Requirement,
  type RequirementSignature,
  type SharedLiquidityData,
  type Transaction,
  type VaultReallocation,
  ZeroCollateralAmountError,
} from "../../types";
import type { FetchParameters } from "../../types/data";

export interface MarketV1Actions {
  /**
   * Fetches the latest market data with accrued interest.
   *
   * @param parameters - Optional fetch parameters (block number, state overrides).
   * @returns Market state including total supply/borrow assets and shares.
   */
  getMarketData: (parameters?: FetchParameters) => Promise<Market>;

  /**
   * Fetches the user's position in this market with accrued interest.
   *
   * @param userAddress - The user whose position to fetch.
   * @param parameters - Optional fetch parameters (block number, state overrides).
   * @returns Accrual position with health metrics (maxBorrowAssets, ltv, isHealthy).
   */
  getPositionData: (
    userAddress: Address,
    parameters?: FetchParameters,
  ) => Promise<AccrualPosition>;

  /**
   * Fetches on-chain state needed to compute shared liquidity reallocations.
   *
   * Fetches vault data, vault market configs, positions, and source market states
   * for each supplying vault via RPC. The returned data is passed to `borrow()` or
   * `supplyCollateralBorrow()` where the reallocation algorithm runs internally.
   *
   * @param params - Supplying vault addresses and optional fetch parameters.
   * @returns Shared liquidity data container for `borrow()`/`supplyCollateralBorrow()`.
   */
  getSharedLiquidityData: (params: {
    supplyingVaults: readonly Address[];
    parameters?: FetchParameters;
  }) => Promise<SharedLiquidityData>;

  /**
   * Prepares a supply-collateral transaction.
   *
   * Routed through bundler via GeneralAdapter1.
   * `getRequirements` returns ERC20 approval or permit for GeneralAdapter1.
   * When `nativeAmount` is provided, native token is wrapped; collateral must be wNative.
   *
   * @param params - Supply collateral parameters.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  supplyCollateral: (params: { userAddress: Address } & DepositAmountArgs) => {
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<MarketV1SupplyCollateralAction>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]>;
  };

  /**
   * Prepares a borrow transaction.
   *
   * Routed through bundler3 via `morphoBorrow`.
   * Validates position health with LLTV buffer (0.5%) using the pre-fetched `accrualPosition`.
   * Computes `minSharePrice` from market borrow state and `slippageTolerance`.
   *
   * When `sharedLiquidity` is provided, `reallocateTo` actions are prepended to the bundle,
   * moving liquidity from other markets via the PublicAllocator before borrowing.
   *
   * `getRequirements` returns `morpho.setAuthorization(generalAdapter1, true)` if not yet authorized,
   * since borrowing through bundler3 requires GeneralAdapter1 authorization on Morpho.
   *
   * @param params - Borrow parameters including pre-fetched `accrualPosition` for health validation.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  borrow: (params: {
    userAddress: Address;
    amount: bigint;
    accrualPosition: AccrualPosition;
    slippageTolerance?: bigint;
    sharedLiquidity?: SharedLiquidityData;
  }) => {
    buildTx: () => Readonly<Transaction<MarketV1BorrowAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<MorphoAuthorizationAction>>[]
    >;
  };

  /**
   * Prepares an atomic supply-collateral-and-borrow transaction.
   *
   * Routed through the bundler. Validates position health with LLTV buffer
   * to prevent instant liquidation on new positions near the LLTV threshold.
   *
   * When `sharedLiquidity` is provided, `reallocateTo` actions are prepended before
   * `morphoBorrow` in the bundle.
   *
   * `getRequirements` returns in parallel:
   * - ERC20 approval or permit for collateral token (to GeneralAdapter1).
   * - `morpho.setAuthorization(generalAdapter1, true)` if adapter is not yet authorized.
   *
   * @param params - Combined parameters including pre-fetched `accrualPosition` for health validation.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  supplyCollateralBorrow: (
    params: {
      userAddress: Address;
      accrualPosition: AccrualPosition;
      borrowAmount: bigint;
      slippageTolerance?: bigint;
      sharedLiquidity?: SharedLiquidityData;
    } & DepositAmountArgs,
  ) => {
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<MarketV1SupplyCollateralBorrowAction>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<
      (
        | Readonly<Transaction<ERC20ApprovalAction>>
        | Readonly<Transaction<MorphoAuthorizationAction>>
        | Requirement
      )[]
    >;
  };
}

export class MorphoMarketV1 implements MarketV1Actions {
  constructor(
    private readonly client: MorphoClientType,
    public readonly marketParams: MarketParams,
    private readonly chainId: number,
  ) {}

  async getMarketData(parameters?: FetchParameters): Promise<Market> {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    return fetchMarket(this.marketParams.id, this.client.viemClient, {
      ...parameters,
      chainId: this.chainId,
    });
  }

  async getPositionData(
    userAddress: Address,
    parameters?: FetchParameters,
  ): Promise<AccrualPosition> {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    return fetchAccrualPosition(
      userAddress,
      this.marketParams.id,
      this.client.viemClient,
      {
        ...parameters,
        chainId: this.chainId,
      },
    );
  }

  async getSharedLiquidityData({
    supplyingVaults,
    parameters,
  }: {
    supplyingVaults: readonly Address[];
    parameters?: FetchParameters;
  }): Promise<SharedLiquidityData> {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    const client = this.client.viemClient;
    const targetMarketId = this.marketParams.id;
    const fetchParams = { ...parameters, chainId: this.chainId };

    // Fetch block info for SimulationState
    const block = await getBlock(
      client,
      parameters?.blockNumber
        ? { blockNumber: parameters.blockNumber }
        : parameters?.blockTag
          ? { blockTag: parameters.blockTag }
          : undefined,
    );

    // Fetch target market
    const targetMarket = await fetchMarket(targetMarketId, client, fetchParams);

    const markets: Record<MarketId, Market> = {
      [targetMarketId]: targetMarket,
    };
    const vaults: Record<string, import("@morpho-org/blue-sdk").Vault> = {};
    const vaultMarketConfigs: Record<
      string,
      Record<string, import("@morpho-org/blue-sdk").VaultMarketConfig>
    > = {};
    const positions: Record<
      string,
      Record<string, import("@morpho-org/blue-sdk").Position>
    > = {};
    const holdings: Record<
      string,
      Record<string, import("@morpho-org/blue-sdk").Holding>
    > = {};

    // Fetch data for each supplying vault in parallel
    await Promise.all(
      supplyingVaults.map(async (vaultAddress) => {
        const vault = await fetchVault(vaultAddress, client, fetchParams);
        vaults[vaultAddress] = vault;
        vaultMarketConfigs[vaultAddress] = {};
        positions[vaultAddress] = {};
        holdings[vaultAddress] = {};

        // Fetch vault's config, position, and loan token holding on target market
        const [targetConfig, targetPosition, loanTokenHolding] =
          await Promise.all([
            fetchVaultMarketConfig(
              vaultAddress,
              targetMarketId,
              client,
              fetchParams,
            ),
            fetchPosition(vaultAddress, targetMarketId, client, fetchParams),
            fetchHolding(
              vaultAddress,
              this.marketParams.loanToken,
              client,
              fetchParams,
            ),
          ]);

        vaultMarketConfigs[vaultAddress][targetMarketId] = targetConfig;
        positions[vaultAddress][targetMarketId] = targetPosition;
        holdings[vaultAddress]![this.marketParams.loanToken] = loanTokenHolding;

        // Fetch data for each source market in the vault's withdraw queue
        const sourceMarketIds = vault.withdrawQueue.filter(
          (id) => id !== targetMarketId,
        );

        await Promise.all(
          sourceMarketIds.map(async (sourceMarketId) => {
            const [sourceConfig, sourcePosition] = await Promise.all([
              fetchVaultMarketConfig(
                vaultAddress,
                sourceMarketId,
                client,
                fetchParams,
              ),
              fetchPosition(vaultAddress, sourceMarketId, client, fetchParams),
            ]);

            vaultMarketConfigs[vaultAddress]![sourceMarketId] = sourceConfig;
            positions[vaultAddress]![sourceMarketId] = sourcePosition;

            // Fetch source market state (deduplicate across vaults)
            if (!markets[sourceMarketId]) {
              markets[sourceMarketId] = await fetchMarket(
                sourceMarketId,
                client,
                fetchParams,
              );
            }
          }),
        );
      }),
    );

    return {
      simulationState: {
        chainId: this.chainId,
        block: {
          number: block.number ?? 0n,
          timestamp: block.timestamp,
        },
        markets,
        vaults,
        vaultMarketConfigs,
        positions,
        holdings,
      },
    };
  }

  supplyCollateral({
    amount = 0n,
    userAddress,
    nativeAmount,
  }: { userAddress: Address } & DepositAmountArgs) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    if (amount < 0n) {
      throw new NonPositiveAssetAmountError(this.marketParams.collateralToken);
    }

    if (nativeAmount !== undefined && nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    const totalCollateral = amount + (nativeAmount ?? 0n);
    if (totalCollateral === 0n) {
      throw new ZeroCollateralAmountError(this.marketParams.id);
    }

    if (nativeAmount) {
      validateNativeCollateral(this.chainId, this.marketParams.collateralToken);
    }

    return {
      getRequirements: (params?: { useSimplePermit?: boolean }) =>
        getRequirements(this.client.viemClient, {
          address: this.marketParams.collateralToken,
          chainId: this.chainId,
          supportSignature: this.client.options.supportSignature,
          supportDeployless: this.client.options.supportDeployless,
          useSimplePermit: params?.useSimplePermit,
          args: { amount, from: userAddress },
        }),

      buildTx: (requirementSignature?: RequirementSignature) =>
        marketV1SupplyCollateral({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            amount,
            nativeAmount,
            onBehalf: userAddress,
            requirementSignature,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  borrow({
    amount,
    userAddress,
    accrualPosition,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    sharedLiquidity,
  }: {
    amount: bigint;
    userAddress: Address;
    accrualPosition: AccrualPosition;
    slippageTolerance?: bigint;
    sharedLiquidity?: SharedLiquidityData;
  }) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    if (amount <= 0n) {
      throw new NonPositiveBorrowAmountError(this.marketParams.id);
    }

    if (slippageTolerance < 0n) {
      throw new NegativeSlippageToleranceError(slippageTolerance);
    }
    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new ExcessiveSlippageToleranceError(slippageTolerance);
    }

    if (!accrualPosition) {
      throw new MissingAccrualPositionError(this.marketParams.id);
    }

    validateAccrualPosition(accrualPosition, this.marketParams.id, userAddress);

    validatePositionHealth(
      accrualPosition,
      0n,
      amount,
      this.marketParams.id,
      this.marketParams.lltv,
    );
    const minSharePrice = computeMinBorrowSharePrice(
      amount,
      accrualPosition.market,
      slippageTolerance,
    );

    let reallocations: readonly VaultReallocation[] | undefined;
    if (sharedLiquidity) {
      reallocations = computeReallocations(
        sharedLiquidity,
        this.marketParams.id,
        {
          enabled: true,
          defaultMaxWithdrawalUtilization:
            this.client.options.sharedLiquidity?.maxWithdrawalUtilization,
        },
      );
      if (reallocations.length > 0) {
        validateReallocations(reallocations);
      }
    }

    return {
      getRequirements: async () => {
        const authTx = await getMorphoAuthorizationRequirement(
          this.client.viemClient,
          this.chainId,
          userAddress,
        );
        return authTx ? [authTx] : [];
      },

      buildTx: () =>
        marketV1Borrow({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            amount,
            receiver: userAddress,
            minSharePrice,
            reallocations,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  supplyCollateralBorrow({
    amount = 0n,
    userAddress,
    accrualPosition,
    borrowAmount,
    nativeAmount,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    sharedLiquidity,
  }: {
    userAddress: Address;
    accrualPosition: AccrualPosition;
    borrowAmount: bigint;
    slippageTolerance?: bigint;
    sharedLiquidity?: SharedLiquidityData;
  } & DepositAmountArgs) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    if (amount < 0n) {
      throw new NonPositiveAssetAmountError(this.marketParams.collateralToken);
    }

    if (nativeAmount !== undefined && nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    if (borrowAmount <= 0n) {
      throw new NonPositiveBorrowAmountError(this.marketParams.id);
    }

    if (!accrualPosition) {
      throw new MissingAccrualPositionError(this.marketParams.id);
    }

    validateAccrualPosition(accrualPosition, this.marketParams.id, userAddress);

    const totalCollateral = amount + (nativeAmount ?? 0n);
    if (totalCollateral === 0n) {
      throw new ZeroCollateralAmountError(this.marketParams.id);
    }

    if (slippageTolerance < 0n) {
      throw new NegativeSlippageToleranceError(slippageTolerance);
    }
    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new ExcessiveSlippageToleranceError(slippageTolerance);
    }

    if (nativeAmount) {
      validateNativeCollateral(this.chainId, this.marketParams.collateralToken);
    }

    validatePositionHealth(
      accrualPosition,
      totalCollateral,
      borrowAmount,
      this.marketParams.id,
      this.marketParams.lltv,
    );

    const minSharePrice = computeMinBorrowSharePrice(
      borrowAmount,
      accrualPosition.market,
      slippageTolerance,
    );

    let reallocations: readonly VaultReallocation[] | undefined;
    if (sharedLiquidity) {
      reallocations = computeReallocations(
        sharedLiquidity,
        this.marketParams.id,
        {
          enabled: true,
          defaultMaxWithdrawalUtilization:
            this.client.options.sharedLiquidity?.maxWithdrawalUtilization,
        },
      );
      if (reallocations.length > 0) {
        validateReallocations(reallocations);
      }
    }

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) => {
        const [erc20Requirements, authTx] = await Promise.all([
          getRequirements(this.client.viemClient, {
            address: this.marketParams.collateralToken,
            chainId: this.chainId,
            supportSignature: this.client.options.supportSignature,
            supportDeployless: this.client.options.supportDeployless,
            useSimplePermit: params?.useSimplePermit,
            args: { amount, from: userAddress },
          }),
          getMorphoAuthorizationRequirement(
            this.client.viemClient,
            this.chainId,
            userAddress,
          ),
        ]);

        return [...erc20Requirements, ...(authTx ? [authTx] : [])];
      },

      buildTx: (requirementSignature?: RequirementSignature) =>
        marketV1SupplyCollateralBorrow({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            amount,
            nativeAmount,
            borrowAmount,
            onBehalf: userAddress,
            receiver: userAddress,
            minSharePrice,
            requirementSignature,
            reallocations,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }
}
