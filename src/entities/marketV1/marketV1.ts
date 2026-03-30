import {
  type AccrualPosition,
  type Market,
  MarketParams,
  MathLib,
  ORACLE_PRICE_SCALE,
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
import { DEFAULT_LLTV_BUFFER, MAX_LLTV_BUFFER } from "../../helpers/constant";
import {
  BorrowExceedsSafeLtvError,
  type DepositAmountArgs,
  type ERC20ApprovalAction,
  ExcessiveLltvBufferError,
  type MarketV1BorrowAction,
  type MarketV1SupplyCollateralAction,
  type MarketV1SupplyCollateralBorrowAction,
  MissingMarketPriceError,
  type MorphoAuthorizationAction,
  type MorphoClientType,
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
   * Always routed through bundler3 via GeneralAdapter1.
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
    marketParams: MarketParams,
    private readonly chainId: number,
  ) {
    this.params = new MarketParams(marketParams);
  }

  async getMarketData(parameters?: FetchParameters): Promise<Market> {
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    return fetchMarket(this.params.id, this.client.viemClient, {
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
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

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

    if (nativeAmount) {
      validateNativeCollateral(this.chainId, this.params.collateralToken);
    }

    return {
      getRequirements: (params?: { useSimplePermit?: boolean }) =>
        getRequirements(this.client.viemClient, {
          address: this.params.collateralToken,
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
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

    if (amount <= 0n) {
      throw new NonPositiveBorrowAmountError(this.params.id);
    }

    return {
      buildTx: () =>
        marketV1Borrow({
          market: {
            chainId: this.chainId,
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
    validateChainId(this.client.viemClient.chain?.id, this.chainId);

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
      validateNativeCollateral(this.chainId, this.params.collateralToken);
    }

    this.validatePositionHealth(
      accrualPosition,
      totalCollateral,
      borrowAmount,
      lltvBuffer,
    );

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) => {
        const [erc20Requirements, authTx] = await Promise.all([
          getRequirements(this.client.viemClient, {
            address: this.params.collateralToken,
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
}
