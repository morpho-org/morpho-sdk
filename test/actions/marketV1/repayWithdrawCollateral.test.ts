import {
  type AccrualPosition,
  DEFAULT_SLIPPAGE_TOLERANCE,
  MathLib,
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
  marketV1RepayWithdrawCollateral,
  NonPositiveRepayAmountError,
  NonPositiveWithdrawCollateralAmountError,
  RepayExceedsDebtError,
  WithdrawMakesPositionUnhealthyError,
} from "../../../src";
import { WethUsdsMarketV1 } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { borrow } from "../../helpers/marketV1Borrow";
import { test } from "../../setup";

describe("RepayWithdrawCollateralMarketV1", () => {
  test("should create repayWithdrawCollateral bundle (by assets)", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);
    const repayAmount = parseUnits("500", 18);
    const withdrawAmount = parseUnits("1", 18);

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

    const action = market.repayWithdrawCollateral({
      userAddress: client.account.address,
      amount: repayAmount,
      withdrawAmount,
      accrualPosition,
    });

    const tx = action.buildTx();

    const maxSharePrice = computeMaxRepaySharePrice(
      repayAmount,
      0n,
      accrualPosition.market,
      DEFAULT_SLIPPAGE_TOLERANCE,
    );

    const directTx = marketV1RepayWithdrawCollateral({
      market: { chainId: mainnet.id, marketParams: WethUsdsMarketV1 },
      args: {
        assets: repayAmount,
        shares: 0n,
        transferAmount: repayAmount,
        withdrawAmount,
        onBehalf: client.account.address,
        receiver: client.account.address,
        maxSharePrice,
      },
    });

    expect(directTx).toStrictEqual(tx);
  });

  test("should repay and withdraw collateral (by assets)", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 18);
    const repayAmount = parseUnits("500", 18);
    const withdrawAmount = parseUnits("1", 18);

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
        const morphoClient = new MorphoClient(client, {
          supportSignature: false,
        });
        const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const action = market.repayWithdrawCollateral({
          userAddress: client.account.address,
          amount: repayAmount,
          withdrawAmount,
          accrualPosition,
        });

        const requirements = await action.getRequirements();

        // Should require ERC20 approval for loan token
        const hasApproval = requirements.some(isRequirementApproval);
        expect(hasApproval).toBe(true);

        // Morpho authorization may already be in place from borrow() setup
        // (which calls setAuthorization directly), so we don't assert hasAuth

        for (const req of requirements) {
          if (isRequirementApproval(req) || isRequirementAuthorization(req)) {
            await client.sendTransaction(req);
          }
        }

        const tx = action.buildTx();
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance - repayAmount,
    );
    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance + withdrawAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral - withdrawAmount,
    );
  });

  test("should full repay by shares and withdraw all collateral", async ({
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

    const morphoClient = new MorphoClient(client, {
      supportSignature: false,
    });
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    // Deal enough loan tokens for the full repay (with slippage buffer for interest accrual)
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

    const action = market.repayWithdrawCollateral({
      userAddress: client.account.address,
      shares: accrualPosition.borrowShares,
      withdrawAmount: accrualPosition.collateral,
      accrualPosition,
    });

    const requirements = await action.getRequirements();
    for (const req of requirements) {
      if (isRequirementApproval(req) || isRequirementAuthorization(req)) {
        await client.sendTransaction(req);
      }
    }

    const tx = action.buildTx();
    await client.sendTransaction(tx);

    // Position should be fully closed
    const finalPosition = await market.getPositionData(client.account.address);
    expect(finalPosition.borrowShares).toBe(0n);
    expect(finalPosition.collateral).toBe(0n);
  });

  test("should throw when withdraw makes position unhealthy (even after repay)", async ({
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

    // Small repay + huge withdraw → still unhealthy
    expect(() =>
      market.repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("10", 18),
        withdrawAmount: parseUnits("9.99", 18),
        accrualPosition,
      }),
    ).toThrow(WithdrawMakesPositionUnhealthyError);
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
      market.repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: borrowAmount * 2n,
        withdrawAmount: parseUnits("1", 18),
        accrualPosition,
      }),
    ).toThrow(RepayExceedsDebtError);
  });

  test("should throw when repay amount is non-positive", async ({ client }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    expect(() =>
      market.repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: 0n,
        withdrawAmount: parseUnits("1", 18),
        accrualPosition,
      }),
    ).toThrow(NonPositiveRepayAmountError);
  });

  test("should throw when withdraw amount is non-positive", async ({
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
      market.repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("500", 18),
        withdrawAmount: 0n,
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
      market.repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("100", 18),
        withdrawAmount: parseUnits("1", 18),
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
      .repayWithdrawCollateral({
        userAddress: client.account.address,
        amount: parseUnits("500", 18),
        withdrawAmount: parseUnits("1", 18),
        accrualPosition,
      })
      .buildTx();

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });
});
