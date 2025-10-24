import { describe, expect } from "vitest";
import { test } from "../setup";

import { instantiateVaultV2, depositVaultV2, createMorphoClient } from "src";
import { mainnet } from "viem/chains";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
    // First Devex with morpho client
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
});
