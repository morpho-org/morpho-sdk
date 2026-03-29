import { getChainAddresses, MarketParams, MathLib } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import type { AnvilTestClient } from "@morpho-org/test";
import { encodeFunctionData, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { MorphoClient, type RequirementSignature } from "../../../src";
import { WstethUsdcMarket } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

/**
 * Executes all requirements (approval txs, authorization txs, signatures).
 * Returns a permit/permit2 signature if one was encountered.
 */
async function executeRequirements(
  client: AnvilTestClient<typeof mainnet>,
  requirements: readonly unknown[],
): Promise<RequirementSignature | undefined> {
  let requirementSignature: RequirementSignature | undefined;

  for (const req of requirements) {
    if (
      req != null &&
      typeof req === "object" &&
      "sign" in req &&
      typeof req.sign === "function"
    ) {
      requirementSignature = await (
        req as {
          sign: (
            c: typeof client,
            addr: `0x${string}`,
          ) => Promise<RequirementSignature>;
        }
      ).sign(client, client.account.address);
    } else if (
      req != null &&
      typeof req === "object" &&
      "to" in req &&
      "data" in req
    ) {
      await client.sendTransaction(
        req as { to: `0x${string}`; data: `0x${string}`; value: bigint },
      );
    }
  }

  return requirementSignature;
}

describe("SupplyCollateralBorrowMarketV1", () => {
  const marketParams = new MarketParams(WstethUsdcMarket);

  test("should atomic supply collateral and borrow with approval", async ({
    client,
  }) => {
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
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        await executeRequirements(client, requirements);

        await client.sendTransaction(scb.buildTx());
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
    expect(finalState.position.borrowAssets).toBeGreaterThan(
      initialState.position.borrowAssets,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + collateralAmount,
    );
  });

  test("should atomic supply and borrow with permit2", async ({ client }) => {
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
        const morphoClient = new MorphoClient(client, {
          supportSignature: true,
        });
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        const requirementSignature = await executeRequirements(
          client,
          requirements,
        );

        await client.sendTransaction(scb.buildTx(requirementSignature));
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + collateralAmount,
    );
  });

  test("should supply collateral and borrow round trip", async ({ client }) => {
    const { morpho } = getChainAddresses(mainnet.id);
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
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        // Supply collateral + borrow
        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        await executeRequirements(client, requirements);
        await client.sendTransaction(scb.buildTx());

        // Repay borrow
        await client.approve({
          address: WstethUsdcMarket.loanToken,
          args: [morpho, MathLib.MAX_UINT_256],
        });

        // Get updated position to know exact borrow amount (with interest)
        const updatedPosition = await market.getPositionData(
          client.account.address,
        );

        // Deal enough to cover borrow + rounding (repay by shares rounds up)
        await client.deal({
          erc20: WstethUsdcMarket.loanToken,
          amount: updatedPosition.borrowAssets + parseUnits("1", 6),
        });

        await client.sendTransaction({
          to: morpho,
          data: encodeFunctionData({
            abi: blueAbi,
            functionName: "repay",
            args: [
              WstethUsdcMarket,
              0n,
              updatedPosition.borrowShares,
              client.account.address,
              "0x",
            ],
          }),
          value: 0n,
        });

        // Withdraw collateral
        await client.sendTransaction({
          to: morpho,
          data: encodeFunctionData({
            abi: blueAbi,
            functionName: "withdrawCollateral",
            args: [
              WstethUsdcMarket,
              collateralAmount,
              client.account.address,
              client.account.address,
            ],
          }),
          value: 0n,
        });
      },
    });

    // After round trip, user should have their collateral back
    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral,
    );
  });
});
