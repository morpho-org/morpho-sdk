import { type Market, MathLib } from "@morpho-org/blue-sdk";
import { MAX_ABSOLUTE_SHARE_PRICE } from "./constant";

/**
 * Computes the minimum borrow share price (in RAY, 1e27) for slippage protection.
 *
 * Mirrors the on-chain check in GeneralAdapter1's `morphoBorrow`:
 * ```solidity
 * require(borrowedAssets.rDivDown(borrowedShares) >= minSharePriceE27)
 * ```
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

  if (expectedShares === 0n) {
    return 0n;
  }

  return MathLib.mulDivDown(
    borrowAmount,
    MathLib.wToRay(MathLib.WAD - slippageTolerance),
    expectedShares,
  );
}

/**
 * Computes the maximum repay share price (in RAY, 1e27) for slippage protection.
 *
 * Supports both repay-by-assets and repay-by-shares paths:
 * - By assets: derives expected shares from the repay amount via `toBorrowShares("Up")`.
 * - By shares: derives expected assets from the shares via `toBorrowAssets("Up")`.
 *
 * Direction is opposite of borrow's `minSharePrice`:
 * - Borrow uses `(WAD - slippage)` → lower bound (protects borrower from getting fewer assets per share).
 * - Repay uses `(WAD + slippage)` → upper bound (protects repayer from paying too many assets per share).
 *
 * Capped at {@link MAX_ABSOLUTE_SHARE_PRICE} to prevent absurd values.
 *
 * @param repayAssets - The amount of assets to repay (0n when repaying by shares).
 * @param repayShares - The amount of shares to repay (0n when repaying by assets).
 * @param market - The market to compute the maximum repay share price for.
 * @param slippageTolerance - Slippage tolerance in WAD (e.g. 0.003e18 = 0.3%).
 * @returns maxSharePriceE27 in RAY scale (1e27).
 */
export function computeMaxRepaySharePrice(
  repayAssets: bigint,
  repayShares: bigint,
  market: Market,
  slippageTolerance: bigint,
): bigint {
  let assets: bigint;
  let shares: bigint;

  if (repayShares > 0n) {
    assets = market.toBorrowAssets(repayShares, "Up");
    shares = repayShares;
  } else {
    assets = repayAssets;
    shares = market.toBorrowShares(repayAssets, "Up");
  }

  if (shares === 0n) {
    return MAX_ABSOLUTE_SHARE_PRICE;
  }

  const maxSharePrice = MathLib.mulDivUp(
    assets,
    MathLib.wToRay(MathLib.WAD + slippageTolerance),
    shares,
  );

  return MathLib.min(maxSharePrice, MAX_ABSOLUTE_SHARE_PRICE);
}
