import { describe, expect } from "vitest";
import { test } from "../setup";

import { instantiateVaultV2, createMorphoClient, redeemVaultV2 } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { parseUnits } from "viem";
import { testInvariants } from "test/helpers/invariants";

describe("Redeem VaultV2", () => {
  test("should create redeem transaction", async ({ client }) => {
    const morpho = createMorphoClient(client);

    const redeem = (await morpho.vaultV2(KeyrockUsdcVaultV2.address)).redeem({
      shares: 1000000000000000000n,
    });

    const vaultV2_2 = await instantiateVaultV2(
      morpho,
      KeyrockUsdcVaultV2.address
    );

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

  test("should redeem 1K shares in vaultV2", async ({ client }) => {
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
        const vaultV2 = await morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const withdraw = vaultV2.withdraw({
          assets,
        });

        await client.sendTransaction(withdraw.tx);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThan(
      initialState.userSharesBalance
    );
    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance + assets
    );
    expect(finalState.userSharesBalance).toEqual(1004842842n);
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance - assets
    );
  });
});
