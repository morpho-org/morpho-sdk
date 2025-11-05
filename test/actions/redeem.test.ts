import { createMorphoClient, instantiateVaultV2, redeemVaultV2 } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Redeem VaultV2", () => {
  test("should create redeem transaction", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const redeem = morpho.vaultV2(KeyrockUsdcVaultV2.address).redeem({
      shares: 1000000000000000000n,
    });

    const vaultV2_2 = instantiateVaultV2(morpho, KeyrockUsdcVaultV2.address);

    const redeem_2 = vaultV2_2.redeem({
      shares: 1000000000000000000n,
    });

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

  test("should redeem 1K USDC in vaultV2", async ({ client }) => {
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
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const redeem = vaultV2.redeem({
          shares,
        });

        await client.sendTransaction(redeem.tx);
      },
    });

    expect(finalState.userSharesBalance).toEqual(
      initialState.userSharesBalance - shares,
    );
    expect(finalState.userAssetBalance).toBeGreaterThan(
      initialState.userAssetBalance,
    );
    expect(finalState.morphoAssetBalance).toBeLessThan(
      initialState.morphoAssetBalance,
    );
  });
});
