import { type Market, MathLib } from "@morpho-org/blue-sdk";

/**
 * Computes the minimum borrow share price (in RAY, 1e27) for slippage protection.
 *
 * Mirrors the on-chain check in GeneralAdapter1's `morphoBorrow`:
 * ```solidity
 * require(borrowedAssets.rDivDown(borrowedShares) >= minSharePriceE27)
 * ```
 *
 * The computation:
 * 1. Derives expected shares from the borrow amount via `toSharesUp` (worst-case rounding for borrower).
 * 2. Applies slippage tolerance to produce a minimum acceptable assets-per-share ratio.
 *
 * @param borrowAmount - The amount of assets to borrow.
 * @param market - The market to compute the minimum borrow share price for.
 * @param slippageTolerance - Slippage tolerance in WAD (e.g. 0.003e18 = 0.3%).
 * @returns minSharePriceE27 in RAY scale (1e27).
 */
export function computeMinBorrowSharePrice(
  borrowAmount: bigint,
  market: Market,
  slippageTolerance: bigint,
): bigint {
  const expectedShares = market.toBorrowShares(borrowAmount, "Up");

  return MathLib.mulDivDown(
    borrowAmount,
    MathLib.wToRay(MathLib.WAD - slippageTolerance),
    expectedShares,
  );
}
