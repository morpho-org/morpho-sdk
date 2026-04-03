import {
  type AccrualPosition,
  DEFAULT_SLIPPAGE_TOLERANCE,
  type Market,
  type MarketParams,
  MathLib,
} from "@morpho-org/blue-sdk";
import { fetchAccrualPosition, fetchMarket } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  getMorphoAuthorizationRequirement,
  getRequirements,
  marketV1Borrow,
  marketV1Repay,
  marketV1RepayWithdrawCollateral,
  marketV1SupplyCollateral,
  marketV1SupplyCollateralBorrow,
  marketV1WithdrawCollateral,
} from "../../actions";
import {
  computeMaxRepaySharePrice,
  computeMinBorrowSharePrice,
  validateAccrualPosition,
  validateChainId,
  validateNativeCollateral,
  validatePositionHealth,
  validatePositionHealthAfterWithdraw,
  validateRepayAmount,
  validateRepayShares,
} from "../../helpers";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  type DepositAmountArgs,
  type ERC20ApprovalAction,
  ExcessiveSlippageToleranceError,
  type MarketV1BorrowAction,
  type MarketV1RepayAction,
  type MarketV1RepayWithdrawCollateralAction,
  type MarketV1SupplyCollateralAction,
  type MarketV1SupplyCollateralBorrowAction,
  type MarketV1WithdrawCollateralAction,
  MissingAccrualPositionError,
  type MorphoAuthorizationAction,
  type MorphoClientType,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
  NonPositiveAssetAmountError,
  NonPositiveBorrowAmountError,
  NonPositiveRepayAmountError,
  NonPositiveWithdrawCollateralAmountError,
  type RepayAmountArgs,
  type Requirement,
  type RequirementSignature,
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
   * When `reallocations` is provided, `reallocateTo` actions are prepended to the bundle,
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
    reallocations?: readonly VaultReallocation[];
  }) => {
    buildTx: () => Readonly<Transaction<MarketV1BorrowAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<MorphoAuthorizationAction>>[]
    >;
  };

  /**
   * Prepares a repay transaction.
   *
   * Routed through bundler3 via GeneralAdapter1.
   * Supports two modes via {@link RepayAmountArgs}:
   * - **By assets** (`{ amount }`): repays an exact asset amount (partial repay).
   * - **By shares** (`{ shares }`): repays exact shares (full repay, immune to interest accrual).
   *
   * Computes `maxSharePrice` from market borrow state and `slippageTolerance`.
   *
   * `getRequirements` returns ERC20 approval for loan token to GeneralAdapter1.
   * Does NOT require Morpho authorization (anyone can repay on behalf of anyone).
   *
   * @param params - Repay parameters including pre-fetched `accrualPosition`.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  repay: (
    params: {
      userAddress: Address;
      accrualPosition: AccrualPosition;
      slippageTolerance?: bigint;
    } & RepayAmountArgs,
  ) => {
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<MarketV1RepayAction>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]>;
  };

  /**
   * Prepares a withdraw-collateral transaction.
   *
   * Routed through bundler3 via `morphoWithdrawCollateral`.
   * Validates position health after withdrawal using the LLTV buffer.
   *
   * `getRequirements` returns `morpho.setAuthorization(generalAdapter1, true)` if not yet authorized.
   * Does NOT require ERC20 approval (collateral flows out of Morpho, not in).
   *
   * @param params - Withdraw collateral parameters including pre-fetched `accrualPosition` for health validation.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  withdrawCollateral: (params: {
    userAddress: Address;
    amount: bigint;
    accrualPosition: AccrualPosition;
  }) => {
    buildTx: () => Readonly<Transaction<MarketV1WithdrawCollateralAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<MorphoAuthorizationAction>>[]
    >;
  };

  /**
   * Prepares an atomic repay-and-withdraw-collateral transaction.
   *
   * Routed through bundler3. Bundle order: repay FIRST, then withdraw.
   * Validates combined position health: simulates the repay, then checks
   * that the resulting position can sustain the collateral withdrawal.
   *
   * `getRequirements` returns in parallel:
   * - ERC20 approval for loan token to GeneralAdapter1 (for the repay).
   * - `morpho.setAuthorization(generalAdapter1, true)` if not yet authorized (for the withdraw).
   *
   * @param params - Combined parameters including pre-fetched `accrualPosition`.
   * @returns Object with `buildTx` and `getRequirements`.
   */
  repayWithdrawCollateral: (
    params: {
      userAddress: Address;
      withdrawAmount: bigint;
      accrualPosition: AccrualPosition;
      slippageTolerance?: bigint;
    } & RepayAmountArgs,
  ) => {
    buildTx: (
      requirementSignature?: RequirementSignature,
    ) => Readonly<Transaction<MarketV1RepayWithdrawCollateralAction>>;
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

  /**
   * Prepares an atomic supply-collateral-and-borrow transaction.
   *
   * Routed through the bundler. Validates position health with LLTV buffer
   * to prevent instant liquidation on new positions near the LLTV threshold.
   *
   * When `reallocations` is provided, `reallocateTo` actions are prepended before
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
      reallocations?: readonly VaultReallocation[];
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
    reallocations,
  }: {
    amount: bigint;
    userAddress: Address;
    accrualPosition: AccrualPosition;
    slippageTolerance?: bigint;
    reallocations?: readonly VaultReallocation[];
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

  repay(
    params: {
      userAddress: Address;
      accrualPosition: AccrualPosition;
      slippageTolerance?: bigint;
    } & RepayAmountArgs,
  ) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    const {
      userAddress,
      accrualPosition,
      slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    } = params;

    const isSharesMode = "shares" in params;

    if (isSharesMode) {
      if (params.shares <= 0n) {
        throw new NonPositiveRepayAmountError(this.marketParams.id);
      }
    } else {
      if (params.amount <= 0n) {
        throw new NonPositiveRepayAmountError(this.marketParams.id);
      }
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

    let assets: bigint;
    let shares: bigint;
    let transferAmount: bigint;

    if (isSharesMode) {
      validateRepayShares(accrualPosition, params.shares, this.marketParams.id);
      assets = 0n;
      shares = params.shares;
      // Add slippage buffer to cover interest accrued between tx construction and execution.
      // Without this, the on-chain repay amount may exceed the pre-transferred ERC20 amount.
      const baseTransferAmount = accrualPosition.market.toBorrowAssets(
        shares,
        "Up",
      );
      transferAmount = MathLib.wMulUp(
        baseTransferAmount,
        MathLib.WAD + slippageTolerance,
      );
    } else {
      validateRepayAmount(accrualPosition, params.amount, this.marketParams.id);
      assets = params.amount;
      shares = 0n;
      transferAmount = params.amount;
    }

    const maxSharePrice = computeMaxRepaySharePrice(
      assets,
      shares,
      accrualPosition.market,
      slippageTolerance,
    );

    return {
      getRequirements: (reqParams?: { useSimplePermit?: boolean }) =>
        getRequirements(this.client.viemClient, {
          address: this.marketParams.loanToken,
          chainId: this.chainId,
          supportSignature: this.client.options.supportSignature,
          supportDeployless: this.client.options.supportDeployless,
          useSimplePermit: reqParams?.useSimplePermit,
          args: { amount: transferAmount, from: userAddress },
        }),

      buildTx: (requirementSignature?: RequirementSignature) =>
        marketV1Repay({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            assets,
            shares,
            transferAmount,
            onBehalf: userAddress,
            maxSharePrice,
            requirementSignature,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  withdrawCollateral({
    userAddress,
    amount,
    accrualPosition,
  }: {
    userAddress: Address;
    amount: bigint;
    accrualPosition: AccrualPosition;
  }) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    if (amount <= 0n) {
      throw new NonPositiveWithdrawCollateralAmountError(this.marketParams.id);
    }

    if (!accrualPosition) {
      throw new MissingAccrualPositionError(this.marketParams.id);
    }

    validateAccrualPosition(accrualPosition, this.marketParams.id, userAddress);

    validatePositionHealthAfterWithdraw(
      accrualPosition,
      amount,
      this.marketParams.id,
      this.marketParams.lltv,
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
        marketV1WithdrawCollateral({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            amount,
            receiver: userAddress,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }

  repayWithdrawCollateral(
    params: {
      userAddress: Address;
      withdrawAmount: bigint;
      accrualPosition: AccrualPosition;
      slippageTolerance?: bigint;
    } & RepayAmountArgs,
  ) {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    const {
      userAddress,
      withdrawAmount,
      accrualPosition,
      slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
    } = params;

    const isSharesMode = "shares" in params;

    if (isSharesMode) {
      if (params.shares <= 0n) {
        throw new NonPositiveRepayAmountError(this.marketParams.id);
      }
    } else {
      if (params.amount <= 0n) {
        throw new NonPositiveRepayAmountError(this.marketParams.id);
      }
    }

    if (withdrawAmount <= 0n) {
      throw new NonPositiveWithdrawCollateralAmountError(this.marketParams.id);
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

    let assets: bigint;
    let shares: bigint;
    let transferAmount: bigint;

    if (isSharesMode) {
      validateRepayShares(accrualPosition, params.shares, this.marketParams.id);
      assets = 0n;
      shares = params.shares;
      const baseTransferAmount = accrualPosition.market.toBorrowAssets(
        shares,
        "Up",
      );
      transferAmount = MathLib.wMulUp(
        baseTransferAmount,
        MathLib.WAD + slippageTolerance,
      );
    } else {
      validateRepayAmount(accrualPosition, params.amount, this.marketParams.id);
      assets = params.amount;
      shares = 0n;
      transferAmount = params.amount;
    }

    // Simulate repay to get post-repay position, then validate withdraw health
    const { position: positionAfterRepay } = accrualPosition.repay(
      assets,
      shares,
    );
    validatePositionHealthAfterWithdraw(
      positionAfterRepay,
      withdrawAmount,
      this.marketParams.id,
      this.marketParams.lltv,
    );

    const maxSharePrice = computeMaxRepaySharePrice(
      assets,
      shares,
      accrualPosition.market,
      slippageTolerance,
    );

    return {
      getRequirements: async (reqParams?: { useSimplePermit?: boolean }) => {
        const [erc20Requirements, authTx] = await Promise.all([
          getRequirements(this.client.viemClient, {
            address: this.marketParams.loanToken,
            chainId: this.chainId,
            supportSignature: this.client.options.supportSignature,
            supportDeployless: this.client.options.supportDeployless,
            useSimplePermit: reqParams?.useSimplePermit,
            args: { amount: transferAmount, from: userAddress },
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
        marketV1RepayWithdrawCollateral({
          market: {
            chainId: this.chainId,
            marketParams: this.marketParams,
          },
          args: {
            assets,
            shares,
            transferAmount,
            withdrawAmount,
            onBehalf: userAddress,
            receiver: userAddress,
            maxSharePrice,
            requirementSignature,
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
    reallocations,
  }: {
    userAddress: Address;
    accrualPosition: AccrualPosition;
    borrowAmount: bigint;
    slippageTolerance?: bigint;
    reallocations?: readonly VaultReallocation[];
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
