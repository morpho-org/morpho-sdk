import { getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  isRequirementApproval,
  MorphoClient,
  marketV1SupplyCollateral,
} from "../../../src";
import { CbbtcUsdcMarketV1, WethUsdsMarketV1 } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

describe("SupplyCollateralMarketV1", () => {
  test("should create supply collateral bundle", async ({ client }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(CbbtcUsdcMarketV1, mainnet.id);

    const supplyCollateral = market.supplyCollateral({
      userAddress: client.account.address,
      amount: parseUnits("1", 18),
    });
    const tx = supplyCollateral.buildTx();

    const directTx = marketV1SupplyCollateral({
      market: {
        chainId: mainnet.id,
        marketParams: CbbtcUsdcMarketV1,
      },
      args: {
        amount: parseUnits("1", 18),
        onBehalf: client.account.address,
      },
    });

    expect(supplyCollateral).toBeDefined();
    expect(directTx).toStrictEqual(tx);
  });

  test("should supply 1 collateral with approval", async ({ client }) => {
    const amount = parseUnits("1", 18);
    await client.deal({
      erc20: CbbtcUsdcMarketV1.collateralToken,
      amount,
    });

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { CbbtcUsdcMarketV1 },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(CbbtcUsdcMarketV1, mainnet.id);

        const supplyCollateral = market.supplyCollateral({
          userAddress: client.account.address,
          amount,
        });

        const requirements = await supplyCollateral.getRequirements();

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
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + amount,
    );
  });

  test("should supply collateral with approval already sufficient", async ({
    client,
  }) => {
    const amount = parseUnits("0.5", 18);
    const { morpho } = getChainAddresses(mainnet.id);

    await client.deal({
      erc20: CbbtcUsdcMarketV1.collateralToken,
      amount,
    });

    await client.approve({
      address: CbbtcUsdcMarketV1.collateralToken,
      args: [morpho, MathLib.MAX_UINT_256],
    });

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { CbbtcUsdcMarketV1 },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(CbbtcUsdcMarketV1, mainnet.id);

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

  test("should supply collateral with native ETH only via wrapping", async ({
    client,
  }) => {
    const nativeAmount = parseUnits("1", 18);

    await client.setBalance({
      address: client.account.address,
      value: nativeAmount + parseUnits("10", 18),
    });

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

        const supplyCollateral = market.supplyCollateral({
          userAddress: client.account.address,
          amount: 0n,
          nativeAmount,
        });

        const requirements = await supplyCollateral.getRequirements();
        expect(requirements.length).toBe(0);

        const tx = supplyCollateral.buildTx();
        expect(tx.value).toEqual(nativeAmount);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + nativeAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + nativeAmount,
    );
  });

  test("should supply collateral with both ERC20 WETH and native ETH via wrapping ", async ({
    client,
  }) => {
    const amount = parseUnits("0.5", 18);
    const nativeAmount = parseUnits("0.5", 18);
    const totalCollateral = amount + nativeAmount;

    await client.deal({
      erc20: WethUsdsMarketV1.collateralToken,
      amount,
    });

    await client.setBalance({
      address: client.account.address,
      value: nativeAmount + parseUnits("10", 18),
    });

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

        const supplyCollateral = market.supplyCollateral({
          userAddress: client.account.address,
          amount,
          nativeAmount,
        });

        const requirements = await supplyCollateral.getRequirements();
        expect(requirements.length).toBe(1);

        const approveTx = requirements[0];
        if (!isRequirementApproval(approveTx)) {
          throw new Error("Expected approval requirement");
        }

        await client.sendTransaction(approveTx);

        const tx = supplyCollateral.buildTx();
        expect(tx.value).toEqual(nativeAmount);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - amount,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + totalCollateral,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + totalCollateral,
    );
  });
});
