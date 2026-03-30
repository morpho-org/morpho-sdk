import { getChainAddresses } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { WstethUsdcMarket } from "../../../test/fixtures/marketV1";
import { test } from "../../../test/setup";
import { NonPositiveBorrowAmountError } from "../../types";
import { marketV1Borrow } from "./borrow";

describe("marketV1Borrow unit tests", () => {
  const { morpho } = getChainAddresses(mainnet.id);
  test("should create direct borrow transaction", async ({ client }) => {
    const amount = parseUnits("1000", 6);

    const tx = marketV1Borrow({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount,
        onBehalf: client.account.address,
        receiver: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("marketV1Borrow");
    expect(tx.action.args.market).toBe(WstethUsdcMarket.id);
    expect(tx.action.args.amount).toBe(amount);
    expect(tx.action.args.receiver).toBe(client.account.address);
    expect(tx.to).toBe(morpho);
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create borrow with different receiver", async ({ client }) => {
    const amount = parseUnits("500", 6);
    const receiver =
      "0x0000000000000000000000000000000000000002" as `0x${string}`;

    const tx = marketV1Borrow({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount,
        onBehalf: client.account.address,
        receiver,
      },
    });

    expect(tx.action.args.receiver).toBe(receiver);
    expect(tx.to).toBe(morpho);
  });

  test("should throw NonPositiveBorrowAmountError when amount is zero", async ({
    client,
  }) => {
    expect(() =>
      marketV1Borrow({
        market: {
          chainId: mainnet.id,
          marketParams: WstethUsdcMarket,
        },
        args: {
          amount: 0n,
          onBehalf: client.account.address,
          receiver: client.account.address,
        },
      }),
    ).toThrow(NonPositiveBorrowAmountError);
  });

  test("should throw NonPositiveBorrowAmountError when amount is negative", async ({
    client,
  }) => {
    expect(() =>
      marketV1Borrow({
        market: {
          chainId: mainnet.id,
          marketParams: WstethUsdcMarket,
        },
        args: {
          amount: -1n,
          onBehalf: client.account.address,
          receiver: client.account.address,
        },
      }),
    ).toThrow(NonPositiveBorrowAmountError);
  });

  test("should return a deep-frozen transaction object", async ({ client }) => {
    const tx = marketV1Borrow({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount: parseUnits("100", 6),
        onBehalf: client.account.address,
        receiver: client.account.address,
      },
    });

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });

  test("should append metadata to transaction data when provided", async ({
    client,
  }) => {
    const amount = parseUnits("100", 6);

    const txWithout = marketV1Borrow({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount,
        onBehalf: client.account.address,
        receiver: client.account.address,
      },
    });

    const txWith = marketV1Borrow({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount,
        onBehalf: client.account.address,
        receiver: client.account.address,
      },
      metadata: { origin: "a1b2c3d4" },
    });

    expect(txWith.data.length).toBeGreaterThan(txWithout.data.length);
    expect(txWith.action.type).toBe("marketV1Borrow");
  });
});
