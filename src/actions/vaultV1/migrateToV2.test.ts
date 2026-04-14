import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  GauntletWethVaultV1,
  SteakhouseUsdcVaultV1,
} from "../../../test/fixtures/vaultV1";
import {
  KeyrockUsdcVaultV2,
  KpkWETHVaultV2,
} from "../../../test/fixtures/vaultV2";
import { test } from "../../../test/setup";
import {
  NegativeMinRedeemSharePriceError,
  NonPositiveMaxSharePriceError,
} from "../../types";
import { vaultV1MigrateToV2 } from "./migrateToV2";

describe("vaultV1MigrateToV2 unit tests", () => {
  test("should create migrate transaction for USDC vaults", async ({
    client,
  }) => {
    const minSharePrice = 1000000000000000000000000000n;
    const maxSharePrice = 1000000000000000000000000000n;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice,
        maxSharePrice,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create migrate transaction for WETH vaults", async ({
    client,
  }) => {
    const minSharePrice = 1000000000000000000000000000n;
    const maxSharePrice = 1000000000000000000000000000n;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: GauntletWethVaultV1.address,
      },
      args: {
        targetVault: KpkWETHVaultV2.address,
        minSharePrice,
        maxSharePrice,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(GauntletWethVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KpkWETHVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should allow different recipient and owner addresses", async ({
    client,
  }) => {
    const differentRecipient =
      "0x1234567890123456789012345678901234567890" as const;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice: 1000000000000000000000000000n,
        maxSharePrice: 1000000000000000000000000000n,
        recipient: differentRecipient,
        owner: client.account.address,
      },
    });

    expect(tx.action.args.recipient).toBe(differentRecipient);
  });

  test("should throw NonPositiveMaxSharePriceError when maxSharePrice is zero", async ({
    client,
  }) => {
    expect(() =>
      vaultV1MigrateToV2({
        vault: {
          chainId: mainnet.id,
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          targetVault: KeyrockUsdcVaultV2.address,
          minSharePrice: 1000000000000000000000000000n,
          maxSharePrice: 0n,
          recipient: client.account.address,
          owner: client.account.address,
        },
      }),
    ).toThrow(NonPositiveMaxSharePriceError);
  });

  test("should throw NonPositiveMaxSharePriceError when maxSharePrice is negative", async ({
    client,
  }) => {
    expect(() =>
      vaultV1MigrateToV2({
        vault: {
          chainId: mainnet.id,
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          targetVault: KeyrockUsdcVaultV2.address,
          minSharePrice: 1000000000000000000000000000n,
          maxSharePrice: -1n,
          recipient: client.account.address,
          owner: client.account.address,
        },
      }),
    ).toThrow(NonPositiveMaxSharePriceError);
  });

  test("should throw NegativeMinRedeemSharePriceError when minSharePrice is negative", async ({
    client,
  }) => {
    expect(() =>
      vaultV1MigrateToV2({
        vault: {
          chainId: mainnet.id,
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          targetVault: KeyrockUsdcVaultV2.address,
          minSharePrice: -1n,
          maxSharePrice: 1000000000000000000000000000n,
          recipient: client.account.address,
          owner: client.account.address,
        },
      }),
    ).toThrow(NegativeMinRedeemSharePriceError);
  });

  test("should accept minSharePrice of 0n", async ({ client }) => {
    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice: 0n,
        maxSharePrice: 1000000000000000000000000000n,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
  });

  test("should return a deep-frozen transaction object", async ({ client }) => {
    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice: 1000000000000000000000000000n,
        maxSharePrice: 1000000000000000000000000000n,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });

  test("should append metadata to transaction data when provided", async ({
    client,
  }) => {
    const args = {
      targetVault: KeyrockUsdcVaultV2.address,
      minSharePrice: 1000000000000000000000000000n,
      maxSharePrice: 1000000000000000000000000000n,
      recipient: client.account.address,
      owner: client.account.address,
    } as const;

    const txWithout = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args,
    });

    const txWith = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args,
      metadata: { origin: "a1b2c3d4" },
    });

    expect(txWith.data.length).toBeGreaterThan(txWithout.data.length);
    expect(txWith.action.type).toBe("vaultV1MigrateToV2");
  });
});
