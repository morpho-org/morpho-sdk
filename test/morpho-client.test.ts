import { describe, expect } from "vitest";
import { createMorphoClient } from "../src/client";
import { test } from "./setup";

import { instantiateVaultV2, depositVaultV2 } from "src";
import { mainnet } from "viem/chains";

const vaultV2Address = "0x04422053aDDbc9bB2759b248B574e3FCA76Bc145";
const vaultV2Asset = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

describe("MorphoClient", () => {
  test("should create a morpho client", ({ client }) => {
    const morpho = createMorphoClient(client);

    expect(morpho).toBeDefined();
    expect(morpho.walletClient).toBeDefined();
    expect(morpho.vaultV2).toBeDefined();
    expect(typeof morpho.vaultV2).toBe("function");
  });

  test("should create deposit bundle", async ({ client }) => {
    // First Devex with morpho client
    const morpho = createMorphoClient(client);

    const deposit = (await morpho.vaultV2(vaultV2Address)).deposit({
      assets: 1000000000000000000n,
    });
    const requirements_1 = await deposit.getRequirements();

    // Second Devex with entity
    const vaultV2_2 = await instantiateVaultV2(morpho, vaultV2Address);

    const deposit_2 = vaultV2_2.deposit({
      assets: 1000000000000000000n,
    });

    const requirements_2 = await deposit_2.getRequirements();

    // Third Devex build directly tx
    const depositTx_3 = depositVaultV2({
      chainId: mainnet.id,
      asset: vaultV2Asset,
      vault: vaultV2Address,
      assets: 1000000000000000000n,
      shares: 995180500366542119986981956374n,
      recipient: client.account.address,
    });

    expect(deposit).toBeDefined();
    expect(deposit.tx).toStrictEqual(deposit_2.tx);
    expect(depositTx_3).toStrictEqual(deposit_2.tx);
    expect(requirements_1).toStrictEqual(requirements_2);
    expect(vaultV2_2.data.asset).toStrictEqual(vaultV2Asset);
  });
});
