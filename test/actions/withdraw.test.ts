import { describe, expect } from "vitest";
import { test } from "../setup";

import { instantiateVaultV2, createMorphoClient, withdrawVaultV2 } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
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
});
