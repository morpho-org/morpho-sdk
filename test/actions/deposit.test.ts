import { describe, expect } from "vitest";
import { test } from "../setup";

import { instantiateVaultV2, depositVaultV2, createMorphoClient } from "src";
import { mainnet } from "viem/chains";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { parseUnits } from "viem";
import { testInvariants } from "test/helpers/invariants";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const deposit = (await morpho.vaultV2(KeyrockUsdcVaultV2.address)).deposit({
      assets: 1000000000000000000n,
    });
    const requirements_1 = await deposit.getRequirements();

    const vaultV2_2 = await instantiateVaultV2(
      morpho,
      KeyrockUsdcVaultV2.address
    );

    const deposit_2 = vaultV2_2.deposit({
      assets: 1000000000000000000n,
    });

    const requirements_2 = await deposit_2.getRequirements();

    const deposit_3 = depositVaultV2({
      chainId: mainnet.id,
      vault: KeyrockUsdcVaultV2.address,
      asset: KeyrockUsdcVaultV2.asset,
      assets: 1000000000000000000n,
      shares: 995180500366542119986981956374n,
      recipient: client.account.address,
    });

    expect(deposit).toBeDefined();
    expect(deposit.tx).toStrictEqual(deposit_2.tx);
    expect(deposit_3).toStrictEqual(deposit_2.tx);
    expect(requirements_1).toStrictEqual(requirements_2);
    expect(vaultV2_2.data.asset).toStrictEqual(KeyrockUsdcVaultV2.asset);
    expect(vaultV2_2.data.address).toStrictEqual(KeyrockUsdcVaultV2.address);
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
        const vaultV2 = await morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const deposit = vaultV2.deposit({
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
      initialState.userAssetBalance - amount
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance
    );
    expect(finalState.userSharesBalance).toEqual(995180494962649293673n);
  });
});
