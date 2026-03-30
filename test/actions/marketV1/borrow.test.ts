import { getChainAddresses, MarketParams, MathLib } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import type { AnvilTestClient } from "@morpho-org/test";
import { encodeFunctionData, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { MorphoClient } from "../../../src";
import { WstethUsdcMarket } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

describe("BorrowMarketV1", () => {
  const marketParams = new MarketParams(WstethUsdcMarket);
  const {
    morpho,
    bundler3: { bundler3 },
  } = getChainAddresses(mainnet.id);

  async function supplyCollateral(
    client: AnvilTestClient<typeof mainnet>,
    collateralAmount: bigint,
  ) {
    await client.approve({
      address: WstethUsdcMarket.collateralToken,
      args: [morpho, MathLib.MAX_UINT_256],
    });
    await client.sendTransaction({
      to: morpho,
      data: encodeFunctionData({
        abi: blueAbi,
        functionName: "supplyCollateral",
        args: [
          WstethUsdcMarket,
          collateralAmount,
          client.account.address,
          "0x",
        ],
      }),
      value: 0n,
    });
  }

  test("should create borrow bundle", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const amount = parseUnits("100", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });
    await supplyCollateral(client, collateralAmount);

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const borrow = market.borrow({
      userAddress: client.account.address,
      amount,
      accrualPosition,
    });

    const tx = borrow.buildTx();

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("marketV1Borrow");
    expect(tx.action.args.amount).toBe(amount);
    expect(tx.to).toBe(bundler3);
    expect(tx.value).toBe(0n);
  });

  test("should supply collateral then borrow USDC", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const {
      markets: {
        WstethUsdcMarket: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WstethUsdcMarket: marketParams },
      },
      actionFn: async () => {
        // 1. Supply collateral first
        await supplyCollateral(client, collateralAmount);

        // 2. Borrow via entity
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
        });

        await client.sendTransaction(borrow.buildTx());
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.borrowAssets).toBeGreaterThan(
      initialState.position.borrowAssets,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
  });
});
