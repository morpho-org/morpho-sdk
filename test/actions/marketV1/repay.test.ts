import {
  type AccrualPosition,
  DEFAULT_SLIPPAGE_TOLERANCE,
  MathLib,
  SharesMath,
} from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  computeMaxRepaySharePrice,
  isRequirementApproval,
  isRequirementAuthorization,
  MissingAccrualPositionError,
  MorphoClient,
  marketV1Repay,
  NonPositiveRepayAmountError,
  RepayExceedsDebtError,
  RepaySharesExceedDebtError,
} from "../../../src";
import { WethUsdsMarketV1 } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { borrow } from "../../helpers/marketV1Borrow";
import { test } from "../../setup";

describe("RepayMarketV1", () => {
  test("should create repay bundle (by assets)", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);
    const repayAmount = parseUnits("500", 18);

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

    const repay = market.repay({
      userAddress: client.account.address,
      amount: repayAmount,
      accrualPosition,
    });

    const tx = repay.buildTx();

    const maxSharePrice = computeMaxRepaySharePrice(
      repayAmount,
      0n,
      accrualPosition.market,
      DEFAULT_SLIPPAGE_TOLERANCE,
    );

    const directTx = marketV1Repay({
      market: { chainId: mainnet.id, marketParams: WethUsdsMarketV1 },
      args: {
        assets: repayAmount,
        shares: 0n,
        transferAmount: repayAmount,
        onBehalf: client.account.address,
        maxSharePrice,
      },
    });

    expect(directTx).toStrictEqual(tx);
  });

  test("should create repay bundle (by shares — full repay)", async ({
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

    const repay = market.repay({
      userAddress: client.account.address,
      shares: accrualPosition.borrowShares,
      accrualPosition,
    });

    const tx = repay.buildTx();

    expect(tx.action.args.shares).toBe(accrualPosition.borrowShares);
    expect(tx.action.args.assets).toBe(0n);
  });

  test("should compute maxSharePrice from real market state", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);
    const repayAmount = parseUnits("500", 18);

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

    const { totalBorrowAssets, totalBorrowShares } = accrualPosition.market;

    const tx = market
      .repay({
        userAddress: client.account.address,
        amount: repayAmount,
        accrualPosition,
      })
      .buildTx();

    const expectedMaxSharePrice = MathLib.mulDivUp(
      repayAmount,
      MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE),
      MathLib.mulDivUp(
        repayAmount,
        totalBorrowShares + SharesMath.VIRTUAL_SHARES,
        totalBorrowAssets + SharesMath.VIRTUAL_ASSETS,
      ),
    );

    expect(tx.action.args.maxSharePrice).toBe(expectedMaxSharePrice);
    expect(tx.action.args.maxSharePrice).toBeGreaterThan(0n);
  });

  test("should repay loan token (by assets)", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);
    const repayAmount = parseUnits("500", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );
    await borrow(client, mainnet.id, WethUsdsMarketV1, borrowAmount);

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

        const repay = market.repay({
          userAddress: client.account.address,
          amount: repayAmount,
          accrualPosition,
        });

        const requirements = await repay.getRequirements();

        // Repay should NOT have morpho authorization requirement
        for (const req of requirements) {
          expect(isRequirementAuthorization(req)).toBe(false);
        }

        // Send approval requirements
        for (const req of requirements) {
          if (isRequirementApproval(req)) {
            await client.sendTransaction(req);
          }
        }

        const tx = repay.buildTx();
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance - repayAmount,
    );
    expect(finalState.morphoLoanTokenBalance).toEqual(
      initialState.morphoLoanTokenBalance + repayAmount,
    );
    // Collateral should not change
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral,
    );
  });

  test("should full repay by shares", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);

    await supplyCollateral(
      client,
      mainnet.id,
      WethUsdsMarketV1,
      collateralAmount,
    );
    await borrow(client, mainnet.id, WethUsdsMarketV1, borrowAmount);

    // Note: share-based full repay leaves dust in GA1 from the slippage buffer,
    // so we don't use testInvariants (which checks bundler3 balances are unchanged).
    const morphoClient = new MorphoClient(client, {
      supportSignature: false,
    });
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    // Deal enough loan tokens to cover the buffered transfer amount
    const baseAmount = accrualPosition.market.toBorrowAssets(
      accrualPosition.borrowShares,
      "Up",
    );
    const dealAmount = MathLib.wMulUp(
      baseAmount,
      MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE,
    );
    await client.deal({
      erc20: WethUsdsMarketV1.loanToken,
      amount: dealAmount,
    });

    const repay = market.repay({
      userAddress: client.account.address,
      shares: accrualPosition.borrowShares,
      accrualPosition,
    });

    const requirements = await repay.getRequirements();
    for (const req of requirements) {
      if (isRequirementApproval(req)) {
        await client.sendTransaction(req);
      }
    }

    const tx = repay.buildTx();
    await client.sendTransaction(tx);

    // After full repay, borrow shares should be 0
    const finalPosition = await market.getPositionData(client.account.address);
    expect(finalPosition.borrowShares).toBe(0n);
  });

  test("should throw when repay amount exceeds debt", async ({ client }) => {
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

    expect(() =>
      market.repay({
        userAddress: client.account.address,
        amount: borrowAmount * 2n,
        accrualPosition,
      }),
    ).toThrow(RepayExceedsDebtError);
  });

  test("should throw when repay shares exceed borrow shares", async ({
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

    expect(() =>
      market.repay({
        userAddress: client.account.address,
        shares: accrualPosition.borrowShares * 2n,
        accrualPosition,
      }),
    ).toThrow(RepaySharesExceedDebtError);
  });

  test("should throw when repay amount is non-positive", async ({ client }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    expect(() =>
      market.repay({
        userAddress: client.account.address,
        amount: 0n,
        accrualPosition,
      }),
    ).toThrow(NonPositiveRepayAmountError);
  });

  test("should revert when accrualPosition is not provided", async ({
    client,
  }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);

    expect(() =>
      market.repay({
        userAddress: client.account.address,
        amount: parseUnits("100", 18),
        accrualPosition: undefined as unknown as AccrualPosition,
      }),
    ).toThrow(MissingAccrualPositionError);
  });

  test("should return deep-frozen transaction", async ({ client }) => {
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

    const tx = market
      .repay({
        userAddress: client.account.address,
        amount: parseUnits("500", 18),
        accrualPosition,
      })
      .buildTx();

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });
});
