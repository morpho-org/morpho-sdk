import {
  type AccrualPosition,
  DEFAULT_SLIPPAGE_TOLERANCE,
  type Market,
  type MarketParams,
  MathLib,
  ORACLE_PRICE_SCALE,
  SharesMath,
} from "@morpho-org/blue-sdk";
import { fetchAccrualPosition, fetchMarket } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getMorphoAuthorizationRequirement,
  getRequirements,
  marketV1Borrow,
  marketV1SupplyCollateral,
  marketV1SupplyCollateralBorrow,
} from "../../actions";
import { validateChainId, validateNativeCollateral } from "../../helpers";
import {
  DEFAULT_LLTV_BUFFER,
  MAX_SLIPPAGE_TOLERANCE,
} from "../../helpers/constant";
import {
  BorrowExceedsSafeLtvError,
  type DepositAmountArgs,
  type ERC20ApprovalAction,
  ExcessiveSlippageToleranceError,
  type MarketV1BorrowAction,
  type MarketV1SupplyCollateralAction,
  type MarketV1SupplyCollateralBorrowAction,
  MissingAccrualPositionError,
  MissingMarketPriceError,
  type MorphoAuthorizationAction,
  type MorphoClientType,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
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
  }: {
    amount: bigint;
    userAddress: Address;
    accrualPosition: AccrualPosition;
    slippageTolerance?: bigint;
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

    this.validatePositionHealth(accrualPosition, 0n, amount);

    const { totalBorrowAssets, totalBorrowShares } = accrualPosition.market;
    const slippageMultiplier = MathLib.wToRay(MathLib.WAD - slippageTolerance);
    const minSharePrice =
      totalBorrowShares === 0n
        ? MathLib.mulDivDown(
            SharesMath.VIRTUAL_ASSETS,
            slippageMultiplier,
            SharesMath.VIRTUAL_SHARES,
          )
        : MathLib.mulDivDown(
            totalBorrowAssets,
            slippageMultiplier,
            totalBorrowShares,
          );

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
  }: {
    userAddress: Address;
    accrualPosition: AccrualPosition;
    borrowAmount: bigint;
    slippageTolerance?: bigint;
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

    this.validatePositionHealth(accrualPosition, totalCollateral, borrowAmount);

    const { totalBorrowAssets, totalBorrowShares } = accrualPosition.market;
    const slippageMultiplier = MathLib.wToRay(MathLib.WAD - slippageTolerance);
    const minSharePrice =
      totalBorrowShares === 0n
        ? MathLib.mulDivDown(
            SharesMath.VIRTUAL_ASSETS,
            slippageMultiplier,
            SharesMath.VIRTUAL_SHARES,
          )
        : MathLib.mulDivDown(
            totalBorrowAssets,
            slippageMultiplier,
            totalBorrowShares,
          );

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
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  // ── Private helpers ──────────────────────────────────────────────

  /**
   * Validates that the resulting position stays within the safe LTV threshold
   * (LLTV minus buffer) after supplying additional collateral and borrowing.
   */
  private validatePositionHealth(
    accrualPosition: AccrualPosition,
    additionalCollateral: bigint,
    borrowAmount: bigint,
  ): void {
    const { price } = accrualPosition.market;

    if (price === undefined) {
      throw new MissingMarketPriceError(this.marketParams.id);
    }

    const totalCollateralAfter =
      accrualPosition.collateral + additionalCollateral;
    const collateralValueAfter = MathLib.mulDivDown(
      totalCollateralAfter,
      price,
      ORACLE_PRICE_SCALE,
    );

    const effectiveLltv = this.marketParams.lltv - DEFAULT_LLTV_BUFFER;

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
}
