import { Market, MarketParams, MathLib } from "@morpho-org/blue-sdk";
import { describe, expect, test } from "vitest";
import { WethUsdsMarketV1 } from "../../test/fixtures/marketV1";
import { ShareDivideByZeroError } from "../types";
import { MAX_ABSOLUTE_SHARE_PRICE } from "./constant";
import {
  computeMaxRepaySharePrice,
  computeMinBorrowSharePrice,
} from "./slippage";

/** 1:1 share-to-asset ratio market for predictable results. */
const normalMarket = new Market({
  params: new MarketParams(WethUsdsMarketV1),
  totalSupplyAssets: 10n ** 24n,
  totalBorrowAssets: 10n ** 24n,
  totalSupplyShares: 10n ** 24n,
  totalBorrowShares: 10n ** 24n,
  lastUpdate: 1_700_000_000n,
  fee: 0n,
  price: 10n ** 36n,
});

/**
 * Extreme market: 1 share backs 10^30 assets.
 * Used to trigger MAX_ABSOLUTE_SHARE_PRICE cap and zero-shares edge case.
 */
const highSharePriceMarket = new Market({
  params: new MarketParams(WethUsdsMarketV1),
  totalSupplyAssets: 10n ** 30n,
  totalBorrowAssets: 10n ** 30n,
  totalSupplyShares: 10n ** 30n,
  totalBorrowShares: 1n,
  lastUpdate: 1_700_000_000n,
  fee: 0n,
  price: 10n ** 36n,
});

const slippage03 = (3n * MathLib.WAD) / 1000n; // 0.3%

describe("computeMinBorrowSharePrice", () => {
  test("should throw ShareDivideByZeroError when borrowAmount is zero", () => {
    expect(() =>
      computeMinBorrowSharePrice(0n, normalMarket, slippage03),
    ).toThrow(ShareDivideByZeroError);
  });

  test("should return a positive share price for a normal borrow", () => {
    const result = computeMinBorrowSharePrice(
      10n ** 18n,
      normalMarket,
      slippage03,
    );
    expect(result).toBeGreaterThan(0n);
  });

  test("should return a lower price with higher slippage tolerance", () => {
    const amount = 10n ** 18n;
    const low = computeMinBorrowSharePrice(amount, normalMarket, slippage03);
    const high = computeMinBorrowSharePrice(
      amount,
      normalMarket,
      (10n * MathLib.WAD) / 1000n, // 1%
    );
    expect(high).toBeLessThan(low);
  });

  test("should return approximately RAY with zero slippage on a 1:1 market", () => {
    const result = computeMinBorrowSharePrice(10n ** 18n, normalMarket, 0n);
    // With virtual shares offset, result is close to but not exactly RAY.
    expect(result).toBeGreaterThan((MathLib.RAY * 99n) / 100n);
    expect(result).toBeLessThanOrEqual(MathLib.RAY);
  });
});

describe("computeMaxRepaySharePrice", () => {
  test("should compute max share price via by-assets path", () => {
    const result = computeMaxRepaySharePrice(
      10n ** 18n,
      0n,
      normalMarket,
      slippage03,
    );
    expect(result).toBeGreaterThan(0n);
  });

  test("should compute max share price via by-shares path", () => {
    const result = computeMaxRepaySharePrice(
      0n,
      10n ** 18n,
      normalMarket,
      slippage03,
    );
    expect(result).toBeGreaterThan(0n);
  });

  test("should return a higher price with higher slippage tolerance", () => {
    const low = computeMaxRepaySharePrice(
      10n ** 18n,
      0n,
      normalMarket,
      slippage03,
    );
    const high = computeMaxRepaySharePrice(
      10n ** 18n,
      0n,
      normalMarket,
      (10n * MathLib.WAD) / 1000n,
    );
    expect(high).toBeGreaterThan(low);
  });

  test("should cap at MAX_ABSOLUTE_SHARE_PRICE for extreme share prices", () => {
    const result = computeMaxRepaySharePrice(
      0n,
      1n,
      highSharePriceMarket,
      slippage03,
    );
    expect(result).toBe(MAX_ABSOLUTE_SHARE_PRICE);
  });

  test("should throw ShareDivideByZeroError when computed shares is zero", () => {
    expect(() =>
      computeMaxRepaySharePrice(1n, 0n, highSharePriceMarket, slippage03),
    ).toThrow(ShareDivideByZeroError);
  });
});
