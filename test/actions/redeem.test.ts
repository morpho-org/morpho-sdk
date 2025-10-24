import { describe, expect } from "vitest";
import { test } from "../setup";

import {
  instantiateVaultV2,
  createMorphoClient,
  withdrawVaultV2,
  redeemVaultV2,
} from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const redeem = (await morpho.vaultV2(KeyrockUsdcVaultV2.address)).redeem({
      shares: 1000000000000000000n,
    });

    // Second Devex with entity
    const vaultV2_2 = await instantiateVaultV2(
      morpho,
      KeyrockUsdcVaultV2.address
    );

    const redeem_2 = vaultV2_2.redeem({
      shares: 1000000000000000000n,
    });

    // Third Devex build directly tx
    const redeem_3 = redeemVaultV2({
      vault: KeyrockUsdcVaultV2.address,
      shares: 1000000000000000000n,
      recipient: client.account.address,
      onBehalf: client.account.address,
    });

    expect(redeem).toBeDefined();
    expect(redeem.tx).toStrictEqual(redeem_2.tx);
    expect(redeem_3).toStrictEqual(redeem_2.tx);
  });
});
