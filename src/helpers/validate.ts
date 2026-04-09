import {
  type AccrualPosition,
  getChainAddresses,
  type MarketId,
  MathLib,
  ORACLE_PRICE_SCALE,
} from "@morpho-org/blue-sdk";
import { isDefined } from "@morpho-org/morpho-ts";
import { type Address, isAddressEqual } from "viem";
import {
  AccrualPositionUserMismatchError,
  AddressMismatchError,
  BorrowExceedsSafeLtvError,
  ChainIdMismatchError,
  ChainWNativeMissingError,
  EmptyReallocationWithdrawalsError,
  ExcessiveSlippageToleranceError,
  MarketIdMismatchError,
  MissingMarketPriceError,
  MutuallyExclusiveRepayAmountsError,
  NativeAmountOnNonWNativeCollateralError,
  NegativeReallocationFeeError,
  NegativeSlippageToleranceError,
  NonPositiveReallocationAmountError,
  NonPositiveRepayAmountError,
  NonPositiveRepayMaxSharePriceError,
  NonPositiveTransferAmountError,
  ReallocationWithdrawalOnTargetMarketError,
  RepayExceedsDebtError,
  RepaySharesExceedDebtError,
  TransferAmountNotEqualToAssetsError,
  UnsortedReallocationWithdrawalsError,
  type VaultReallocation,
  WithdrawExceedsCollateralError,
  WithdrawMakesPositionUnhealthyError,
} from "../types";
import { DEFAULT_LLTV_BUFFER, MAX_SLIPPAGE_TOLERANCE } from "./constant";

/**
 * Validates that the provided user address matches the client's connected account.
 * Only enforced when the client has an account — skips validation for public clients
 * (e.g., when building transactions to be signed externally).
 *
 * Throws {@link AddressMismatchError} if the client account is present
 * and does not match `userAddress`.
 *
 * @param clientAccountAddress - The client's account address (may be undefined).
 * @param userAddress - The user address provided by the caller.
 */
export const validateUserAddress = (
  clientAccountAddress: Address | undefined,
  userAddress: Address,
): void => {
  if (
    clientAccountAddress !== undefined &&
    !isAddressEqual(clientAccountAddress, userAddress)
  ) {
    throw new AddressMismatchError(clientAccountAddress, userAddress);
  }
};

/**
 * Validates that the accrual position belongs to the expected market and user.
 * Throws {@link MarketIdMismatchError} if the position's market ID
 * does not match the expected market.
 * Throws {@link AccrualPositionUserMismatchError} if the position's user
 * does not match the expected user.
 *
 * @param positionData - The accrual position to validate.
 * @param expectedMarketId - The market ID the position must belong to.
 * @param expectedUser - The user address the position must belong to.
 */
export const validateAccrualPosition = (
  positionData: AccrualPosition,
  expectedMarketId: MarketId,
  expectedUser: Address,
): void => {
  if (positionData.marketId !== expectedMarketId) {
    throw new MarketIdMismatchError(positionData.marketId, expectedMarketId);
  }
  if (!isAddressEqual(positionData.user, expectedUser)) {
    throw new AccrualPositionUserMismatchError(positionData.user, expectedUser);
  }
};

/**
 * Validates that the resulting position stays within the safe LTV threshold
 * (LLTV minus buffer) after supplying additional collateral and borrowing.
 *
 * @param positionData - The current accrual position with market data.
 * @param additionalCollateral - Amount of collateral being added.
 * @param borrowAmount - Amount being borrowed.
 * @param marketId - The market identifier (for error messages).
 * @param lltv - The market's liquidation LTV.
 */
export const validatePositionHealth = (
  positionData: AccrualPosition,
  additionalCollateral: bigint,
  borrowAmount: bigint,
  marketId: MarketId,
  lltv: bigint,
): void => {
  const { price } = positionData.market;

  if (!price) {
    throw new MissingMarketPriceError(marketId);
  }

  const totalCollateralAfter = positionData.collateral + additionalCollateral;
  const collateralValueAfter = MathLib.mulDivDown(
    totalCollateralAfter,
    price,
    ORACLE_PRICE_SCALE,
  );

  const effectiveLltv =
    lltv > DEFAULT_LLTV_BUFFER ? lltv - DEFAULT_LLTV_BUFFER : 0n;

  const maxSafeBorrowAfter = MathLib.wMulDown(
    collateralValueAfter,
    effectiveLltv,
  );

  const totalBorrowAfter = positionData.borrowAssets + borrowAmount + 1n; // +1 to account for share-to-asset rounding (happens when the borrow amount doesn't divide evenly into shares)

  if (totalBorrowAfter > maxSafeBorrowAfter) {
    const maxSafeAdditionalBorrow = MathLib.zeroFloorSub(
      maxSafeBorrowAfter,
      positionData.borrowAssets,
    );
    throw new BorrowExceedsSafeLtvError(borrowAmount, maxSafeAdditionalBorrow);
  }
};

/**
 * Validates that the viem client chain ID matches the expected chain ID.
 * Throws {@link ChainIdMismatchError} if they differ.
 *
 * @param clientChainId - Chain ID reported by the viem client (may be undefined).
 * @param expectedChainId - Chain ID expected by the entity or action.
 */
export const validateChainId = (
  clientChainId: number | undefined,
  expectedChainId: number,
): void => {
  if (clientChainId !== expectedChainId) {
    throw new ChainIdMismatchError(clientChainId, expectedChainId);
  }
};

/**
 * Validates that the given collateral token is the chain's wrapped native token.
 * Throws {@link ChainWNativeMissingError} if wNative is not configured for the chain.
 * Throws {@link NativeAmountOnNonWNativeCollateralError} if collateral is not wNative.
 *
 * @param chainId - The chain to look up wNative on.
 * @param collateralToken - The market's collateral token address.
 */
export const validateNativeCollateral = (
  chainId: number,
  collateralToken: Address,
): void => {
  const { wNative } = getChainAddresses(chainId);
  if (!isDefined(wNative)) {
    throw new ChainWNativeMissingError(chainId);
  }
  if (!isAddressEqual(collateralToken, wNative)) {
    throw new NativeAmountOnNonWNativeCollateralError(collateralToken, wNative);
  }
};

/**
 * Validates that the resulting position stays within the safe LTV threshold
 * (LLTV minus buffer) after withdrawing collateral.
 *
 * @param positionData - The current accrual position with market data.
 * @param withdrawAmount - Amount of collateral being withdrawn.
 * @param lltv - The market's liquidation LTV.
 * @param marketId - The market identifier (for error messages).
 */
export const validatePositionHealthAfterWithdraw = (
  positionData: AccrualPosition,
  withdrawAmount: bigint,
  lltv: bigint,
  marketId: MarketId,
): void => {
  if (positionData.marketId !== marketId) {
    throw new MarketIdMismatchError(positionData.marketId, marketId);
  }
  if (withdrawAmount > positionData.collateral) {
    throw new WithdrawExceedsCollateralError(
      withdrawAmount,
      positionData.collateral,
      marketId,
    );
  }

  // No debt means position is always healthy — oracle price not needed.
  if (positionData.borrowAssets === 0n) {
    return;
  }

  const { price } = positionData.market;

  if (!price) {
    throw new MissingMarketPriceError(positionData.marketId);
  }

  const collateralAfter = positionData.collateral - withdrawAmount;
  const collateralValueAfter = MathLib.mulDivDown(
    collateralAfter,
    price,
    ORACLE_PRICE_SCALE,
  );

  const effectiveLltv =
    lltv > DEFAULT_LLTV_BUFFER ? lltv - DEFAULT_LLTV_BUFFER : 0n;
  const maxSafeBorrowAfter = MathLib.wMulDown(
    collateralValueAfter,
    effectiveLltv,
  );

  if (positionData.borrowAssets > maxSafeBorrowAfter) {
    throw new WithdrawMakesPositionUnhealthyError(
      withdrawAmount,
      positionData.borrowAssets,
      maxSafeBorrowAfter,
    );
  }
};

/**
 * Validates that the repay amount assets does not exceed the outstanding debt.
 *
 * @param positionData - The current accrual position.
 * @param repayAssets - The amount of assets to repay.
 * @param marketId - The market identifier (for error messages).
 */
export const validateRepayAmount = (
  positionData: AccrualPosition,
  repayAssets: bigint,
  marketId: MarketId,
): void => {
  if (repayAssets > positionData.borrowAssets) {
    throw new RepayExceedsDebtError(
      repayAssets,
      positionData.borrowAssets,
      marketId,
    );
  }
};

/**
 * Validates that the repay shares do not exceed the outstanding borrow shares.
 *
 * @param positionData - The current accrual position.
 * @param repayShares - The amount of shares to repay.
 * @param marketId - The market identifier (for error messages).
 */
export const validateRepayShares = (
  positionData: AccrualPosition,
  repayShares: bigint,
  marketId: MarketId,
): void => {
  if (repayShares > positionData.borrowShares) {
    throw new RepaySharesExceedDebtError(
      repayShares,
      positionData.borrowShares,
      marketId,
    );
  }
};

/**
 * Validates the common repay input parameters shared by `marketV1Repay`
 * and `marketV1RepayWithdrawCollateral`.
 *
 * @param assets - Repay assets amount (0n when repaying by shares).
 * @param shares - Repay shares amount (0n when repaying by assets).
 * @param transferAmount - ERC20 amount to transfer to GeneralAdapter1.
 * @param maxSharePrice - Maximum repay share price (in ray). Must be positive.
 * @param marketId - The market identifier (for error messages).
 */
export const validateRepayParams = (
  assets: bigint,
  shares: bigint,
  transferAmount: bigint,
  maxSharePrice: bigint,
  marketId: MarketId,
): void => {
  if (maxSharePrice <= 0n) {
    throw new NonPositiveRepayMaxSharePriceError(marketId);
  }

  if (assets < 0n || shares < 0n) {
    throw new NonPositiveRepayAmountError(marketId);
  }

  if (assets > 0n && shares > 0n) {
    throw new MutuallyExclusiveRepayAmountsError(marketId);
  }

  if (assets === 0n && shares === 0n) {
    throw new NonPositiveRepayAmountError(marketId);
  }

  if (transferAmount <= 0n) {
    throw new NonPositiveTransferAmountError(marketId);
  }

  if (assets > 0n && transferAmount !== assets) {
    throw new TransferAmountNotEqualToAssetsError(
      transferAmount,
      assets,
      marketId,
    );
  }
};

/**
 * Validates that vault reallocations are well-formed.
 *
 * Enforces the following invariants for each {@link VaultReallocation}:
 * - `fee` must be non-negative.
 * - `withdrawals` must be non-empty.
 * - Every withdrawal `amount` must be strictly positive.
 * - No withdrawal may target `targetMarketId` (the borrow market).
 * - Withdrawal market IDs must be strictly ascending (required by `PublicAllocator.reallocateTo`).
 *
 * @param reallocations - The reallocations to validate.
 * @param targetMarketId - The ID of the market being borrowed from. No withdrawal may reference this market.
 */
export const validateReallocations = (
  reallocations: readonly VaultReallocation[],
  targetMarketId: MarketId,
): void => {
  for (const r of reallocations) {
    if (r.fee < 0n) {
      throw new NegativeReallocationFeeError(r.vault);
    }
    if (r.withdrawals.length === 0) {
      throw new EmptyReallocationWithdrawalsError(r.vault);
    }
    let prevId: MarketId | undefined;
    for (const w of r.withdrawals) {
      if (w.amount <= 0n) {
        throw new NonPositiveReallocationAmountError(
          r.vault,
          w.marketParams.id,
        );
      }
      if (w.marketParams.id === targetMarketId) {
        throw new ReallocationWithdrawalOnTargetMarketError(
          r.vault,
          w.marketParams.id,
        );
      }
      if (prevId !== undefined && w.marketParams.id <= prevId) {
        throw new UnsortedReallocationWithdrawalsError(
          r.vault,
          w.marketParams.id,
        );
      }
      prevId = w.marketParams.id;
    }
  }
};

/**
 * Validates that a slippage tolerance is within an acceptable range.
 *
 * Throws {@link NegativeSlippageToleranceError} if negative.
 * Throws {@link ExcessiveSlippageToleranceError} if greater than {@link MAX_SLIPPAGE_TOLERANCE}.
 *
 * @param slippageTolerance - The slippage tolerance in WAD.
 */
export const validateSlippageTolerance = (slippageTolerance: bigint): void => {
  if (slippageTolerance < 0n) {
    throw new NegativeSlippageToleranceError(slippageTolerance);
  }
  if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
    throw new ExcessiveSlippageToleranceError(slippageTolerance);
  }
};
