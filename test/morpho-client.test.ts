import { describe, test, expect } from "vitest";
import { createMorphoClient } from "../src/client";
import { mainnet } from "viem/chains";
import { createWalletClient, http } from "viem";
import { createVaultV2 } from "src";

describe("MorphoClient", () => {
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: http(),
    account: "0x0000000000000000000000000000000000000000",
  });

  test("should create a morpho client", () => {
    const morpho = createMorphoClient(walletClient);

    expect(morpho).toBeDefined();
    expect(morpho.walletClient).toBeDefined();
    expect(morpho.vaultV2).toBeDefined();
    expect(typeof morpho.vaultV2).toBe("function");
  });

  test("should create deposit bundle", async () => {
    // First Devex with morpho client
    const morpho = createMorphoClient(walletClient);

    const depositBundle = morpho
      .vaultV2({
        asset: "0x0000000000000000000000000000000000000001",
        vault: "0x0000000000000000000000000000000000000002",
      })
      .deposit({
        amount: 1000000000000000000n,
      });

    // Second Devex with entity
    const vaultV2 = createVaultV2(morpho, {
      vault: "0x0000000000000000000000000000000000000002",
      asset: "0x0000000000000000000000000000000000000001",
    });
    const depositTx = vaultV2.deposit({
      amount: 1000000000000000000n,
    });

    expect(depositBundle).toBeDefined();
    expect(depositTx).toStrictEqual(depositBundle);
  });
});
