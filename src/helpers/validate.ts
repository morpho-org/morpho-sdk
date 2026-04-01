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
  AccrualPositionMarketMismatchError,
  AccrualPositionUserMismatchError,
  BorrowExceedsSafeLtvError,
  ChainIdMismatchError,
  ChainWNativeMissingError,
  EmptyReallocationWithdrawalsError,
  MissingMarketPriceError,
  NativeAmountOnNonWNativeCollateralError,
  NegativeReallocationFeeError,
  NonPositiveReallocationAmountError,
  type VaultReallocation,
} from "../types";
import { DEFAULT_LLTV_BUFFER } from "./constant";

/**
 * Validates that the accrual position belongs to the expected market and user.
 * Throws {@link AccrualPositionMarketMismatchError} if the position's market ID
 * does not match the expected market.
 * Throws {@link AccrualPositionUserMismatchError} if the position's user
 * does not match the expected user.
 *
 * @param accrualPosition - The accrual position to validate.
 * @param expectedMarketId - The market ID the position must belong to.
 * @param expectedUser - The user address the position must belong to.
 */
export const validateAccrualPosition = (
  accrualPosition: AccrualPosition,
  expectedMarketId: MarketId,
  expectedUser: Address,
): void => {
  if (accrualPosition.marketId !== expectedMarketId) {
    throw new AccrualPositionMarketMismatchError(
      accrualPosition.marketId,
      expectedMarketId,
    );
  }
  if (!isAddressEqual(accrualPosition.user, expectedUser)) {
    throw new AccrualPositionUserMismatchError(
      accrualPosition.user,
      expectedUser,
    );
  }
};

/**
 * Validates that the resulting position stays within the safe LTV threshold
 * (LLTV minus buffer) after supplying additional collateral and borrowing.
 *
 * @param accrualPosition - The current accrual position with market data.
 * @param additionalCollateral - Amount of collateral being added.
 * @param borrowAmount - Amount being borrowed.
 * @param marketId - The market identifier (for error messages).
 * @param lltv - The market's liquidation LTV.
 */
export const validatePositionHealth = (
  accrualPosition: AccrualPosition,
  additionalCollateral: bigint,
  borrowAmount: bigint,
  marketId: MarketId,
  lltv: bigint,
): void => {
  const { price } = accrualPosition.market;

  if (price === undefined) {
    throw new MissingMarketPriceError(marketId);
  }

  const totalCollateralAfter =
    accrualPosition.collateral + additionalCollateral;
  const collateralValueAfter = MathLib.mulDivDown(
    totalCollateralAfter,
    price,
    ORACLE_PRICE_SCALE,
  );

  const effectiveLltv = lltv - DEFAULT_LLTV_BUFFER;

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
 * Validates that vault reallocations are well-formed.
 *
 * @param reallocations - The reallocations to validate.
 */
export const validateReallocations = (
  reallocations: readonly VaultReallocation[],
): void => {
  for (const r of reallocations) {
    if (r.fee < 0n) {
      throw new NegativeReallocationFeeError(r.vault);
    }
    if (r.withdrawals.length === 0) {
      throw new EmptyReallocationWithdrawalsError(r.vault);
    }
    for (const w of r.withdrawals) {
      if (w.amount <= 0n) {
        throw new NonPositiveReallocationAmountError(
          r.vault,
          w.marketParams.id,
        );
      }
    }
  }
};
