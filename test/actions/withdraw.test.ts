import { createMorphoClient, instantiateVaultV2, withdrawVaultV2 } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Withdraw VaultV2", () => {
  test("should create redeem transaction", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const withdraw = morpho.vaultV2(KeyrockUsdcVaultV2.address).withdraw({
      assets: 1000000000000000000n,
    });

    // Second Devex with entity
    const vaultV2_2 = instantiateVaultV2(morpho, KeyrockUsdcVaultV2.address);

    const withdraw_2 = vaultV2_2.withdraw({
      assets: 1000000000000000000n,
    });

    // Third Devex build directly tx
    const withdraw_3 = withdrawVaultV2({
      vault: KeyrockUsdcVaultV2.address,
      assets: 1000000000000000000n,
      recipient: client.account.address,
      onBehalf: client.account.address,
    });

    expect(withdraw).toBeDefined();
    expect(withdraw.tx).toStrictEqual(withdraw_2.tx);
    expect(withdraw_3).toStrictEqual(withdraw_2.tx);
  });

  test("should withdraw 1K assets in vaultV2", async ({ client }) => {
    const shares = parseUnits("1000", 18);
    const assets = parseUnits("1000", 6);
    await client.deal({
      erc20: KeyrockUsdcVaultV2.address,
      amount: shares,
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
        const withdraw = vaultV2.withdraw({
          assets,
        });

        await client.sendTransaction(withdraw.tx);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThan(
      initialState.userSharesBalance,
    );
    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance + assets,
    );
    expect(finalState.userSharesBalance).toEqual(4819505037350706326n);
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance - assets,
    );
  });
});
