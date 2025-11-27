import { MorphoClient, vaultV2Withdraw } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Withdraw VaultV2", () => {
  test("should create redeem transaction", async ({ client }) => {
    const morpho = new MorphoClient(client);

    const withdraw = morpho
      .vaultV2(KeyrockUsdcVaultV2.address, mainnet.id)
      .withdraw({
        userAddress: client.account.address,
        assets: 1000000000000000000n,
      });
    const tx_1 = withdraw.buildTx();

    const tx_2 = vaultV2Withdraw({
      vault: {
        address: KeyrockUsdcVaultV2.address,
      },
      args: {
        assets: 1000000000000000000n,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(withdraw).toBeDefined();
    expect(tx_1).toStrictEqual(tx_2);
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
        const morpho = new MorphoClient(client);
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
        const withdraw = vaultV2.withdraw({
          userAddress: client.account.address,
          assets,
        });
        const tx = withdraw.buildTx();

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userSharesBalance).toBeLessThan(
      initialState.userSharesBalance,
    );
    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance + assets,
    );
    expect(finalState.userSharesBalance).toEqual(14456377621545858217n);
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance - assets,
    );
  });
});
