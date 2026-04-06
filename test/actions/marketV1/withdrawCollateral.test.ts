import type { AccrualPosition } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  MissingAccrualPositionError,
  MorphoClient,
  marketV1WithdrawCollateral,
  NonPositiveWithdrawCollateralAmountError,
  WithdrawExceedsCollateralError,
  WithdrawMakesPositionUnhealthyError,
} from "../../../src";
import { WethUsdsMarketV1 } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { borrow } from "../../helpers/marketV1Borrow";
import { test } from "../../setup";

describe("WithdrawCollateralMarketV1", () => {
  test("should create withdrawCollateral bundle", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const withdraw = market.withdrawCollateral({
      userAddress: client.account.address,
      amount: collateralAmount,
      accrualPosition,
    });

    const tx = withdraw.buildTx();

    const directTx = marketV1WithdrawCollateral({
      market: { chainId: mainnet.id, marketParams: WethUsdsMarketV1 },
      args: {
        amount: collateralAmount,
        onBehalf: client.account.address,
        receiver: client.account.address,
      },
    });

    expect(directTx).toStrictEqual(tx);
  });

  test("should withdraw collateral (no debt)", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const withdrawAmount = parseUnits("5", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );

    const {
      markets: {
        WethUsdsMarketV1: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WethUsdsMarketV1 },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const withdraw = market.withdrawCollateral({
          userAddress: client.account.address,
          amount: withdrawAmount,
          accrualPosition,
        });

        const tx = withdraw.buildTx();
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance + withdrawAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral - withdrawAmount,
    );
    // Loan token should not change
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance,
    );
  });

  // full withdraw
  test("should full withdraw collateral", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const withdrawAmount = collateralAmount;

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );
    await borrow(client, mainnet.id, WethUsdsMarketV1, parseUnits("1000", 18));

    const {
      markets: {
        WethUsdsMarketV1: { finalState },
      },
    } = await testInvariants({
      client,
      params: { markets: { WethUsdsMarketV1 } },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const withdraw = market.withdrawCollateral({
          userAddress: client.account.address,
          amount: withdrawAmount,
          accrualPosition,
        });

        const tx = withdraw.buildTx();
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.position.collateral).toEqual(0n);
  });

  test("should throw when withdraw makes position unhealthy", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );
    await borrow(client, mainnet.id, WethUsdsMarketV1, borrowAmount);

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    // Try to withdraw most of the collateral — should make position unhealthy
    expect(() =>
      market.withdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("9.99", 18),
        accrualPosition,
      }),
    ).toThrow(WithdrawMakesPositionUnhealthyError);
  });

  test("should throw when withdraw exceeds collateral", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );

    // Create a borrow position so borrowAssets > 0 (triggers the check path)
    await borrow(client, mainnet.id, WethUsdsMarketV1, parseUnits("100", 18));

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    expect(() =>
      market.withdrawCollateral({
        userAddress: client.account.address,
        amount: collateralAmount + 1n,
        accrualPosition,
      }),
    ).toThrow(WithdrawExceedsCollateralError);
  });

  test("should throw when withdraw amount is non-positive", async ({
    client,
  }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    expect(() =>
      market.withdrawCollateral({
        userAddress: client.account.address,
        amount: 0n,
        accrualPosition,
      }),
    ).toThrow(NonPositiveWithdrawCollateralAmountError);
  });

  test("should revert when accrualPosition is not provided", async ({
    client,
  }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);

    expect(() =>
      market.withdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("1", 18),
        accrualPosition: undefined as unknown as AccrualPosition,
      }),
    ).toThrow(MissingAccrualPositionError);
  });

  test("should return deep-frozen transaction", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const tx = market
      .withdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("1", 18),
        accrualPosition,
      })
      .buildTx();

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });
});
