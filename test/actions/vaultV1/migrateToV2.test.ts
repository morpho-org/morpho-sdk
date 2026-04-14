import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { isRequirementApproval, MorphoClient } from "../../../src";
import { SteakhouseUsdcVaultV1 } from "../../fixtures/vaultV1";
import { KeyrockUsdcVaultV2 } from "../../fixtures/vaultV2";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

describe("MigrateToV2 VaultV1", () => {
  test("should create migration bundle via entity", async ({ client }) => {
    const morpho = new MorphoClient(client);

    const vaultV1 = morpho.vaultV1(SteakhouseUsdcVaultV1.address, mainnet.id);
    const accrualVault = await vaultV1.getData();

    const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
    const targetAccrualVault = await vaultV2.getData();

    const migrate = vaultV1.migrateToV2({
      userAddress: client.account.address,
      accrualVault,
      targetAccrualVault,
    });

    const tx = migrate.buildTx();

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should migrate full USDC position from V1 to V2", async ({
    client,
  }) => {
    const shares = parseUnits("1000", 18);
    await client.deal({
      erc20: SteakhouseUsdcVaultV1.address,
      amount: shares,
    });

    const {
      vaults: {
        SteakhouseUsdcVaultV1: { initialState: v1Initial, finalState: v1Final },
        KeyrockUsdcVaultV2: { initialState: v2Initial, finalState: v2Final },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { SteakhouseUsdcVaultV1, KeyrockUsdcVaultV2 },
      },
      actionFn: async () => {
        const morpho = new MorphoClient(client);
        const vaultV1 = morpho.vaultV1(
          SteakhouseUsdcVaultV1.address,
          mainnet.id,
        );
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);

        const accrualVault = await vaultV1.getData();
        const targetAccrualVault = await vaultV2.getData();

        const migrate = vaultV1.migrateToV2({
          userAddress: client.account.address,
          accrualVault,
          targetAccrualVault,
        });

        const requirements = await migrate.getRequirements();

        // Should have at least one approval requirement (V1 share approval for GA1)
        expect(requirements.length).toBeGreaterThanOrEqual(1);

        for (const req of requirements) {
          if (isRequirementApproval(req)) {
            await client.sendTransaction(req);
          }
        }

        const tx = migrate.buildTx();
        await client.sendTransaction(tx);
      },
    });

    // V1: all shares should be gone
    expect(v1Final.userSharesBalance).toBe(0n);
    expect(v1Final.userSharesBalance).toBeLessThan(v1Initial.userSharesBalance);

    // V2: user should have received shares
    expect(v2Final.userSharesBalance).toBeGreaterThan(
      v2Initial.userSharesBalance,
    );

    // User's underlying asset balance should be roughly unchanged
    // (assets moved vault-to-vault, not through user's wallet)
    expect(v1Final.userAssetBalance).toEqual(v1Initial.userAssetBalance);
  });
});
