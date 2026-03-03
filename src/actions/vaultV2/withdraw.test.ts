import { KeyrockUsdcVaultV2, KpkWETHVaultV2 } from "test/fixtures/vaultV2";
import { parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "../../../test/setup";
import { ZeroAssetAmountError } from "../../types";
import { vaultV2Withdraw } from "./withdraw";

describe("withdrawVaultV2 unit tests", () => {
  test("should create withdraw transaction with USDC vault", async ({
    client,
  }) => {
    const assets = parseUnits("1000", 6); // 1000 USDC

    const tx = vaultV2Withdraw({
      vault: {
        address: KeyrockUsdcVaultV2.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Withdraw");
    expect(tx.action.args.vault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create withdraw transaction with WETH vault", async ({
    client,
  }) => {
    const assets = parseUnits("5", 18); // 5 WETH

    const tx = vaultV2Withdraw({
      vault: {
        address: KpkWETHVaultV2.address,
      },
      args: {
        assets,
        recipient: client.account.address,
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Withdraw");
    expect(tx.action.args.vault).toBe(KpkWETHVaultV2.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBe(KpkWETHVaultV2.address);
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should throw ZeroAssetAmountError when assets is zero", async () => {
    expect(() =>
      vaultV2Withdraw({
        vault: {
          address: KeyrockUsdcVaultV2.address,
        },
        args: {
          assets: 0n,
          recipient: "0x1234567890123456789012345678901234567890",
          onBehalf: "0x1234567890123456789012345678901234567890",
        },
      }),
    ).toThrow(ZeroAssetAmountError);
  });
});
