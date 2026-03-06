import { MarketParams } from "@morpho-org/blue-sdk";
import { getAddress, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { MorphoClient } from "../../src";
import { vaultV2ForceWithdraw } from "../../src/actions/vaultV2/forceWithdraw";
import { ReEcosystemUsdcVaultV2 } from "../fixtures/vaultV2";
import { testInvariants } from "../helpers/invariants";
import { test } from "../setup";

describe("ForceWithdraw VaultV2", () => {
  const mockMarketParams = new MarketParams({
    loanToken: getAddress("0x000000000000000000000000000000000000000A"),
    collateralToken: getAddress("0x000000000000000000000000000000000000000B"),
    oracle: getAddress("0x000000000000000000000000000000000000000C"),
    irm: getAddress("0x000000000000000000000000000000000000000D"),
    lltv: parseUnits("0.8", 18),
  });

  test("should create force withdraw transaction with marketParams", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);
    const assets = parseUnits("100", 18);

    const vaultV2 = morpho.vaultV2(ReEcosystemUsdcVaultV2.address, mainnet.id);

    const vaultV2Data = await vaultV2.getData();

    vaultV2Data.adapters.forEach((adapter) => {
      console.log(adapter);
    });

    const deallocations = [
      {
        adapter: mockAdapterAddress,
        marketParams: mockMarketParams,
        assets,
      },
    ] as const;

    const forceWithdraw = vaultV2.forceWithdraw({
      deallocations,
      withdraw: { assets },
      userAddress: client.account.address,
    });
    const tx_1 = forceWithdraw.buildTx();

    const tx_2 = vaultV2ForceWithdraw({
      vault: { address: ReEcosystemUsdcVaultV2.address },
      args: {
        deallocations,
        withdraw: { assets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    expect(forceWithdraw).toBeDefined();
    expect(tx_1).toStrictEqual(tx_2);

    const {
      vaults: {
        ReEcosystemUsdcVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { ReEcosystemUsdcVaultV2 },
      },
      actionFn: async () => {
        await client.sendTransaction(tx_1);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThanOrEqual(
      initialState.userSharesBalance,
    );
  });

  test("should force withdraw transaction without marketParams", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);
    const assets = parseUnits("50", 6);
    const deallocations = [{ adapter: mockAdapterAddress, assets }] as const;

    const forceWithdraw = morpho
      .vaultV2(ReEcosystemUsdcVaultV2.address, mainnet.id)
      .forceWithdraw({
        deallocations,
        withdraw: { assets },
        userAddress: client.account.address,
      });
    const tx = forceWithdraw.buildTx();

    const {
      vaults: {
        ReEcosystemUsdcVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { ReEcosystemUsdcVaultV2 },
      },
      actionFn: async () => {
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThanOrEqual(
      initialState.userSharesBalance,
    );
  });

  test("should force withdraw transaction with multiple deallocations", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);
    const assets1 = parseUnits("60", 18);
    const assets2 = parseUnits("40", 18);
    const withdrawAssets = parseUnits("100", 18);

    const mockAdapterAddress2 = getAddress(
      "0x0000000000000000000000000000000000000003",
    );

    const deallocations = [
      {
        adapter: mockAdapterAddress,
        marketParams: mockMarketParams,
        assets: assets1,
      },
      { adapter: mockAdapterAddress2, assets: assets2 },
    ] as const;

    const forceWithdraw = morpho
      .vaultV2(ReEcosystemUsdcVaultV2.address, mainnet.id)
      .forceWithdraw({
        deallocations,
        withdraw: { assets: withdrawAssets },
        userAddress: client.account.address,
      });
    const tx = forceWithdraw.buildTx();

    const {
      vaults: {
        ReEcosystemUsdcVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { ReEcosystemUsdcVaultV2 },
      },
      actionFn: async () => {
        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThanOrEqual(
      initialState.userSharesBalance,
    );
  });
});
