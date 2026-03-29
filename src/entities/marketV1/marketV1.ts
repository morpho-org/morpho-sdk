import {
  type AccrualPosition,
  getChainAddresses,
  type Market,
  MarketParams,
  MathLib,
  ORACLE_PRICE_SCALE,
} from "@morpho-org/blue-sdk";
import {
  blueAbi,
  fetchAccrualPosition,
  fetchMarket,
} from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  type Hex,
  isAddressEqual,
  publicActions,
} from "viem";
import {
  getRequirements,
  getRequirementsApproval,
  marketV1Borrow,
  marketV1SupplyCollateral,
  marketV1SupplyCollateralBorrow,
} from "../../actions";
import { DEFAULT_LLTV_BUFFER, MAX_LLTV_BUFFER } from "../../helpers/constant";
import {
  BorrowExceedsSafeLtvError,
  ChainIdMismatchError,
  ChainWNativeMissingError,
  type DepositAmountArgs,
  type ERC20ApprovalAction,
  ExcessiveLltvBufferError,
  type MarketParamsInput,
  type MarketV1BorrowAction,
  type MarketV1SupplyCollateralAction,
  type MarketV1SupplyCollateralBorrowAction,
  MissingMarketPriceError,
  type MorphoAuthorizationAction,
  type MorphoClientType,
  NativeAmountOnNonWNativeCollateralError,
  NegativeLltvBufferError,
  NegativeNativeAmountError,
  NonPositiveAssetAmountError,
  NonPositiveBorrowAmountError,
  type Requirement,
  type RequirementSignature,
  type Transaction,
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
   * Prepares a supply-collateral transaction.
   *
   * - **Direct path** (ERC20 only): calls `morpho.supplyCollateral()` directly. No bundler.
   * - **Bundler path** (`nativeAmount` provided): wraps native token via GeneralAdapter1.
   *
   * `getRequirements` returns ERC20 approval for Morpho (direct) or GeneralAdapter1 (bundler).
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
   * Direct call to `morpho.borrow()`. No bundler, no requirements.
   * Caller must have sufficient collateral to pass the on-chain health check.
   *
   * @param params - Borrow parameters.
   * @returns Object with `buildTx`.
   */
  borrow: (params: { userAddress: Address; amount: bigint }) => {
    buildTx: () => Readonly<Transaction<MarketV1BorrowAction>>;
  };

  /**
   * Prepares an atomic supply-collateral-and-borrow transaction.
   *
   * Routed through the bundler. Validates position health with LLTV buffer
   * to prevent instant liquidation on new positions near the LLTV threshold.
   *
   * `getRequirements` returns:
   * - ERC20 approval for collateral token (to GeneralAdapter1).
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
      lltvBuffer?: bigint;
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
  private readonly params: MarketParams;

  constructor(
    private readonly client: MorphoClientType,
    inputMarketParams: MarketParamsInput,
    private readonly chainId: number,
  ) {
    this.params = new MarketParams(inputMarketParams);
  }

  async getMarketData(parameters?: FetchParameters): Promise<Market> {
    this.validateChainId();

    return fetchMarket(this.params.id, this.client.viemClient, {
      ...parameters,
      chainId: this.chainId,
    });
  }

  async getPositionData(
    userAddress: Address,
    parameters?: FetchParameters,
  ): Promise<AccrualPosition> {
    this.validateChainId();

    return fetchAccrualPosition(
      userAddress,
      this.params.id,
      this.client.viemClient,
      {
        ...parameters,
        chainId: this.chainId,
      },
    );
  }

  supplyCollateral({
    amount = 0n,
    userAddress,
    nativeAmount,
  }: { userAddress: Address } & DepositAmountArgs) {
    this.validateChainId();

    if (amount < 0n) {
      throw new NonPositiveAssetAmountError(this.params.collateralToken);
    }

    if (nativeAmount !== undefined && nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    const totalCollateral = amount + (nativeAmount ?? 0n);
    if (totalCollateral === 0n) {
      throw new ZeroCollateralAmountError(this.params.id);
    }

    const useBundler = !!nativeAmount;
    const { morpho } = getChainAddresses(this.chainId);

    if (useBundler) {
      this.validateNativeCollateral();
    }

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) => {
        if (useBundler) {
          return getRequirements(this.client.viemClient, {
            address: this.params.collateralToken,
            chainId: this.chainId,
            supportSignature: this.client.options.supportSignature,
            supportDeployless: this.client.options.supportDeployless,
            useSimplePermit: params?.useSimplePermit,
            args: { amount, from: userAddress },
          });
        }

        // Direct path: approve Morpho contract for collateral token
        const allowance = await this.readErc20Allowance(
          this.params.collateralToken,
          userAddress,
          morpho,
        );

        return getRequirementsApproval({
          address: this.params.collateralToken,
          chainId: this.chainId,
          args: {
            spendAmount: totalCollateral,
            approvalAmount: totalCollateral,
            spender: morpho,
          },
          allowances: allowance,
        });
      },

      buildTx: (requirementSignature?: RequirementSignature) =>
        marketV1SupplyCollateral({
          market: {
            chainId: this.chainId,
            morpho,
            marketId: this.params.id as Hex,
            marketParams: this.params,
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

  borrow({ amount, userAddress }: { amount: bigint; userAddress: Address }) {
    this.validateChainId();

    if (amount <= 0n) {
      throw new NonPositiveBorrowAmountError(this.params.id);
    }

    const { morpho } = getChainAddresses(this.chainId);

    return {
      buildTx: () =>
        marketV1Borrow({
          market: {
            morpho,
            marketId: this.params.id as Hex,
            marketParams: this.params,
          },
          args: {
            amount,
            onBehalf: userAddress,
            receiver: userAddress,
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
    lltvBuffer = DEFAULT_LLTV_BUFFER,
    nativeAmount,
  }: {
    userAddress: Address;
    accrualPosition: AccrualPosition;
    borrowAmount: bigint;
    lltvBuffer?: bigint;
  } & DepositAmountArgs) {
    this.validateChainId();

    if (amount < 0n) {
      throw new NonPositiveAssetAmountError(this.params.collateralToken);
    }

    if (nativeAmount !== undefined && nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    if (borrowAmount <= 0n) {
      throw new NonPositiveBorrowAmountError(this.params.id);
    }

    if (lltvBuffer < 0n) {
      throw new NegativeLltvBufferError(lltvBuffer);
    }
    if (lltvBuffer > MAX_LLTV_BUFFER) {
      throw new ExcessiveLltvBufferError(lltvBuffer);
    }

    const totalCollateral = amount + (nativeAmount ?? 0n);
    if (totalCollateral === 0n) {
      throw new ZeroCollateralAmountError(this.params.id);
    }

    if (nativeAmount) {
      this.validateNativeCollateral();
    }

    // --- LLTV buffer health check ---
    this.validatePositionHealth(
      accrualPosition,
      totalCollateral,
      borrowAmount,
      lltvBuffer,
    );

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) => {
        const results: (
          | Readonly<Transaction<ERC20ApprovalAction>>
          | Readonly<Transaction<MorphoAuthorizationAction>>
          | Requirement
        )[] = [];

        // 1. Collateral token approval for GeneralAdapter1 (bundler path)
        const erc20Requirements = await getRequirements(
          this.client.viemClient,
          {
            address: this.params.collateralToken,
            chainId: this.chainId,
            supportSignature: this.client.options.supportSignature,
            supportDeployless: this.client.options.supportDeployless,
            useSimplePermit: params?.useSimplePermit,
            args: { amount, from: userAddress },
          },
        );
        results.push(...erc20Requirements);

        // 2. Morpho authorization for GeneralAdapter1 (required for borrow via bundler)
        const authTx =
          await this.getMorphoAuthorizationRequirement(userAddress);
        if (authTx) {
          results.push(authTx);
        }

        return results;
      },

      buildTx: (requirementSignature?: RequirementSignature) =>
        marketV1SupplyCollateralBorrow({
          market: {
            chainId: this.chainId,
            marketId: this.params.id as Hex,
            marketParams: this.params,
          },
          args: {
            amount,
            nativeAmount,
            borrowAmount,
            onBehalf: userAddress,
            receiver: userAddress,
            requirementSignature,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  // ── Private helpers ──────────────────────────────────────────────

  private validateChainId(): void {
    if (
      this.client.viemClient.chain?.id &&
      this.client.viemClient.chain?.id !== this.chainId
    ) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }
  }

  private validateNativeCollateral(): void {
    const { wNative } = getChainAddresses(this.chainId);
    if (!wNative) {
      throw new ChainWNativeMissingError(this.chainId);
    }
    if (!isAddressEqual(this.params.collateralToken, wNative)) {
      throw new NativeAmountOnNonWNativeCollateralError(
        this.params.collateralToken,
        wNative,
      );
    }
  }

  /**
   * Validates that the resulting position stays within the safe LTV threshold
   * (LLTV minus buffer) after supplying additional collateral and borrowing.
   */
  private validatePositionHealth(
    accrualPosition: AccrualPosition,
    additionalCollateral: bigint,
    borrowAmount: bigint,
    lltvBuffer: bigint,
  ): void {
    const { price } = accrualPosition.market;

    if (price === undefined) {
      throw new MissingMarketPriceError(this.params.id);
    }

    const totalCollateralAfter =
      accrualPosition.collateral + additionalCollateral;
    const collateralValueAfter = MathLib.mulDivDown(
      totalCollateralAfter,
      price,
      ORACLE_PRICE_SCALE,
    );

    const effectiveLltv = this.params.lltv - lltvBuffer;
    const maxSafeBorrowAfter = MathLib.wMulDown(
      collateralValueAfter,
      effectiveLltv,
    );

    const totalBorrowAfter = accrualPosition.borrowAssets + borrowAmount;

    if (totalBorrowAfter > maxSafeBorrowAfter) {
      const maxSafeAdditionalBorrow = MathLib.zeroFloorSub(
        maxSafeBorrowAfter,
        accrualPosition.borrowAssets,
      );
      throw new BorrowExceedsSafeLtvError(
        borrowAmount,
        maxSafeAdditionalBorrow,
      );
    }
  }

  /**
   * Reads ERC20 allowance via eth_call on the viem client.
   */
  private async readErc20Allowance(
    token: Address,
    owner: Address,
    spender: Address,
  ): Promise<bigint> {
    const pc = this.client.viemClient.extend(publicActions);
    return pc.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "allowance",
      args: [owner, spender],
    });
  }

  /**
   * Checks if GeneralAdapter1 is authorized on Morpho for the user.
   * If not, returns a `setAuthorization` transaction.
   */
  private async getMorphoAuthorizationRequirement(
    userAddress: Address,
  ): Promise<Readonly<Transaction<MorphoAuthorizationAction>> | null> {
    const {
      morpho,
      bundler3: { generalAdapter1 },
    } = getChainAddresses(this.chainId);

    const pc = this.client.viemClient.extend(publicActions);
    const isAuthorized = await pc.readContract({
      address: morpho,
      abi: blueAbi,
      functionName: "isAuthorized",
      args: [userAddress, generalAdapter1],
    });

    if (isAuthorized) {
      return null;
    }

    return deepFreeze({
      to: morpho,
      data: encodeFunctionData({
        abi: blueAbi,
        functionName: "setAuthorization",
        args: [generalAdapter1, true],
      }),
      value: 0n,
      action: {
        type: "morphoAuthorization",
        args: {
          authorized: generalAdapter1,
          isAuthorized: true,
        },
      },
    });
  }
}
