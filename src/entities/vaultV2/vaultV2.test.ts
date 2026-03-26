import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  KeyrockUsdcVaultV2,
  KpkWETHVaultV2,
} from "../../../test/fixtures/vaultV2";
import { test } from "../../../test/setup";
import { MorphoClient } from "../../client";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  ExcessiveSlippageToleranceError,
  NativeAmountOnNonWNativeVaultError,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
} from "../../types";

describe("MorphoVaultV2 entity tests", () => {
  describe("slippageTolerance boundary", () => {
    test("should accept slippageTolerance of exactly 0n", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(
        KeyrockUsdcVaultV2.address,
        mainnet.id,
      );

      const result = await vault.deposit({
        amount: parseUnits("100", 6),
        userAddress: client.account.address,
        slippageTolerance: 0n,
      });

      expect(result.buildTx).toBeDefined();
      expect(result.getRequirements).toBeDefined();

      const tx = result.buildTx();
      expect(tx.data).toBeDefined();
      expect(tx.value).toBe(0n);
    });

    test("should accept slippageTolerance of exactly MAX_SLIPPAGE_TOLERANCE", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(
        KeyrockUsdcVaultV2.address,
        mainnet.id,
      );

      const result = await vault.deposit({
        amount: parseUnits("100", 6),
        userAddress: client.account.address,
        slippageTolerance: MAX_SLIPPAGE_TOLERANCE,
      });

      expect(result.buildTx).toBeDefined();
      expect(result.getRequirements).toBeDefined();

      const tx = result.buildTx();
      expect(tx.data).toBeDefined();
      expect(tx.value).toBe(0n);
    });

    test("should throw ExcessiveSlippageToleranceError when slippageTolerance exceeds MAX", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(
        KeyrockUsdcVaultV2.address,
        mainnet.id,
      );

      await expect(
        vault.deposit({
          amount: parseUnits("100", 6),
          userAddress: client.account.address,
          slippageTolerance: MAX_SLIPPAGE_TOLERANCE + 1n,
        }),
      ).rejects.toThrow(ExcessiveSlippageToleranceError);
    });

    test("should throw NegativeSlippageToleranceError when slippageTolerance is negative", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(
        KeyrockUsdcVaultV2.address,
        mainnet.id,
      );

      await expect(
        vault.deposit({
          amount: parseUnits("100", 6),
          userAddress: client.account.address,
          slippageTolerance: -1n,
        }),
      ).rejects.toThrow(NegativeSlippageToleranceError);
    });
  });

  describe("nativeAmount validation", () => {
    test("should throw NegativeNativeAmountError for negative nativeAmount", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(KpkWETHVaultV2.address, mainnet.id);

      await expect(
        vault.deposit({
          amount: 0n,
          nativeAmount: -1n,
          userAddress: client.account.address,
        }),
      ).rejects.toThrow(NegativeNativeAmountError);
    });

    test("should throw NativeAmountOnNonWNativeVaultError for non-WETH vault", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV2(
        KeyrockUsdcVaultV2.address,
        mainnet.id,
      );

      await expect(
        vault.deposit({
          amount: 0n,
          nativeAmount: parseUnits("1", 18),
          userAddress: client.account.address,
        }),
      ).rejects.toThrow(NativeAmountOnNonWNativeVaultError);
    });
  });
});
