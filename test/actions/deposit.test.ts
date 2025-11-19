import { createMorphoClient, instantiateVaultV2, vaultV2Deposit } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address);
    const deposit = await vault.deposit({
      assets: 1000000000000000000n,
    });
    const requirements_1 = await deposit.getRequirements();

    const vaultV2_2 = instantiateVaultV2(morpho, KeyrockUsdcVaultV2.address);

    const deposit_2 = await vaultV2_2.deposit({
      assets: 1000000000000000000n,
    });

    const requirements_2 = await deposit_2.getRequirements();

    const deposit_3 = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: KeyrockUsdcVaultV2.address,
        asset: KeyrockUsdcVaultV2.asset,
      },
      args: {
        assets: 1000000000000000000n,
        maxSharePrice: 1005144292549515n,
        recipient: client.account.address,
      },
    });

    const data = await vaultV2_2.getData();

    expect(deposit).toBeDefined();
    expect(deposit.tx).toStrictEqual(deposit_2.tx);
    expect(deposit_3).toStrictEqual(deposit_2.tx);
    expect(requirements_1).toStrictEqual(requirements_2);
    expect(data.asset).toStrictEqual(KeyrockUsdcVaultV2.asset);
    expect(data.address).toStrictEqual(KeyrockUsdcVaultV2.address);
  });

  test("should deposit 1K USDC in vaultV2", async ({ client }) => {
    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: KeyrockUsdcVaultV2.asset,
      amount: amount,
    });

    const {
      vaults: {
        KeyrockUsdcVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { KeyrockUsdcVaultV2 },
      },
      actionFn: async () => {
        const morpho = createMorphoClient(client);
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const deposit = await vaultV2.deposit({
          assets: amount,
        });

        const requirements = await deposit.getRequirements();

        const approveTx = requirements[0];
        if (!approveTx) {
          throw new Error("Approve transaction not found");
        }

        await client.sendTransaction(approveTx);
        await client.sendTransaction(deposit.tx);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount,
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount,
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance,
    );
    expect(finalState.userSharesBalance).toEqual(995180492265720444556n);
  });
});
