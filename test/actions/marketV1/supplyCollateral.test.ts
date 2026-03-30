import { getChainAddresses, MarketParams, MathLib } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  isRequirementApproval,
  MorphoClient,
  marketV1SupplyCollateral,
} from "../../../src";
import { WstethUsdcMarket } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

describe("SupplyCollateralMarketV1", () => {
  const marketParams = new MarketParams(WstethUsdcMarket);

  test("should create supply collateral bundle", async ({ client }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);

    const supplyCollateral = market.supplyCollateral({
      userAddress: client.account.address,
      amount: parseUnits("1", 18),
    });

    const requirements = await supplyCollateral.getRequirements();
    const tx = supplyCollateral.buildTx();

    const tx2 = marketV1SupplyCollateral({
      market: {
        chainId: mainnet.id,
        marketParams: WstethUsdcMarket,
      },
      args: {
        amount: parseUnits("1", 18),
        onBehalf: client.account.address,
      },
    });

    expect(supplyCollateral).toBeDefined();
    expect(requirements).toBeDefined();
    expect(tx).toStrictEqual(tx2);
  });

  test("should supply 1 wstETH collateral with approval (direct path)", async ({
    client,
  }) => {
    const amount = parseUnits("1", 18);
    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount,
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

        const supplyCollateral = market.supplyCollateral({
          userAddress: client.account.address,
          amount,
        });

        const requirements = await supplyCollateral.getRequirements();

        const approveTx = requirements[0];
        if (!approveTx) {
          throw new Error("Approve transaction not found");
        }
        if (!isRequirementApproval(approveTx)) {
          throw new Error("Expected approval requirement");
        }

        await client.sendTransaction(approveTx);
        await client.sendTransaction(supplyCollateral.buildTx());
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - amount,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + amount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + amount,
    );
  });

  test("should supply wstETH collateral with approval already sufficient (direct path)", async ({
    client,
  }) => {
    const amount = parseUnits("0.5", 18);
    const { morpho } = getChainAddresses(mainnet.id);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount,
    });

    await client.approve({
      address: WstethUsdcMarket.collateralToken,
      args: [morpho, MathLib.MAX_UINT_256],
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

        const supplyCollateral = market.supplyCollateral({
          userAddress: client.account.address,
          amount,
        });

        const requirements = await supplyCollateral.getRequirements();
        expect(requirements.length).toBe(1);

        const approveTx = requirements[0];
        if (!isRequirementApproval(approveTx)) {
          throw new Error("Expected approval requirement");
        }

        await client.sendTransaction(approveTx);

        const tx = supplyCollateral.buildTx();

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - amount,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + amount,
    );
  });
});
