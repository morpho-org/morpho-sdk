import { parseUnits } from "viem";
import { describe, expect } from "vitest";
import {
  GauntletWethVaultV1,
  SteakhouseUsdcVaultV1,
} from "../../../test/fixtures/vaultV1";
import { test } from "../../../test/setup";
import { NonPositiveAssetAmountError } from "../../types";
import { vaultV1Withdraw } from "./withdraw";

describe("withdrawVaultV1 unit tests", () => {
  test("should create withdraw transaction with USDC vault", async ({
    client,
  }) => {
    const assets = parseUnits("1000", 6);

    const tx = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1Withdraw");
    expect(tx.action.args.vault).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create withdraw transaction with WETH vault", async ({
    client,
  }) => {
    const assets = parseUnits("5", 18);

    const tx = vaultV1Withdraw({
      vault: {
        address: GauntletWethVaultV1.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1Withdraw");
    expect(tx.action.args.vault).toBe(GauntletWethVaultV1.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBe(GauntletWethVaultV1.address);
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should allow different recipient and onBehalf addresses", async ({
    client,
  }) => {
    const assets = parseUnits("500", 6);
    const differentRecipient =
      "0x1234567890123456789012345678901234567890" as const;

    const tx = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets,
        recipient: differentRecipient,
        onBehalf: client.account.address,
      },
    });

    expect(tx.action.args.recipient).toBe(differentRecipient);
    expect(tx.to).toBe(SteakhouseUsdcVaultV1.address);
  });

  test("should throw NonPositiveAssetAmountError when assets is zero", async () => {
    expect(() =>
      vaultV1Withdraw({
        vault: {
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          assets: 0n,
          recipient: "0x1234567890123456789012345678901234567890",
          onBehalf: "0x1234567890123456789012345678901234567890",
        },
      }),
    ).toThrow(NonPositiveAssetAmountError);
  });

  test("should throw NonPositiveAssetAmountError when assets is negative", async () => {
    expect(() =>
      vaultV1Withdraw({
        vault: {
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          assets: -1n,
          recipient: "0x1234567890123456789012345678901234567890",
          onBehalf: "0x1234567890123456789012345678901234567890",
        },
      }),
    ).toThrow(NonPositiveAssetAmountError);
  });

  test("should return a deep-frozen transaction object", async ({ client }) => {
    const tx = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets: parseUnits("100", 6),
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });

  test("should append metadata to transaction data when provided", async ({
    client,
  }) => {
    const assets = parseUnits("100", 6);

    const txWithout = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    const txWith = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
      metadata: { origin: "a1b2c3d4" },
    });

    expect(txWith.data.length).toBeGreaterThan(txWithout.data.length);
    expect(txWith.action.type).toBe("vaultV1Withdraw");
  });

  test("should encode calldata targeting the vault address directly", async ({
    client,
  }) => {
    const tx = vaultV1Withdraw({
      vault: {
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        assets: parseUnits("1000", 6),
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(tx.to).toBe(SteakhouseUsdcVaultV1.address);
  });
});
