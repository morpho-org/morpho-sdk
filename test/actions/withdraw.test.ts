import { describe, expect } from "vitest";
import { test } from "../setup";

import { instantiateVaultV2, createMorphoClient, withdrawVaultV2 } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { parseUnits } from "viem";
import { testInvariants } from "test/helpers/invariants";

describe("Withdraw VaultV2", () => {
  test("should create withdraw transaction", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const withdraw = (
      await morpho.vaultV2(KeyrockUsdcVaultV2.address)
    ).withdraw({
      assets: 1000000000000000000n,
    });

    // Second Devex with entity
    const vaultV2_2 = await instantiateVaultV2(
      morpho,
      KeyrockUsdcVaultV2.address
    );

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

  test("should withdraw 1K USDC in vaultV2", async ({ client }) => {
    const shares = parseUnits("1000", 18);
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
        const vaultV2 = await morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const redeem = vaultV2.redeem({
          shares: shares,
        });

        await client.sendTransaction(redeem.tx);
      },
    });

    expect(finalState.userSharesBalance).toEqual(
      initialState.userSharesBalance - shares
    );
    expect(finalState.userAssetBalance).toBeGreaterThan(
      initialState.userAssetBalance
    );
    expect(finalState.userAssetBalance).toEqual(1004842842n);
    expect(finalState.morphoAssetBalance).toBeLessThan(
      initialState.morphoAssetBalance
    );
  });
});
