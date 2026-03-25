import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { SteakhouseUsdcVaultV1 } from "../../../test/fixtures/vaultV1";
import { test } from "../../../test/setup";
import { MorphoClient } from "../../client";
import { MAX_SLIPPAGE_TOLERANCE } from "../../helpers/constant";
import {
  ExcessiveSlippageToleranceError,
  isRequirementApproval,
  NegativeSlippageToleranceError,
} from "../../types";

describe("MorphoVaultV1 entity tests", () => {
  describe("slippageTolerance boundary", () => {
    test("should accept slippageTolerance of exactly 0n", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: true,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
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
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
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
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
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
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
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

  describe("getRequirements with supportSignature: false", () => {
    test("should return classic approval requirements when supportSignature is false", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: false,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
        mainnet.id,
      );

      const { getRequirements } = await vault.deposit({
        amount: parseUnits("100", 6),
        userAddress: client.account.address,
      });

      const requirements = await getRequirements();

      expect(requirements).toHaveLength(1);

      const approval = requirements[0];
      if (!isRequirementApproval(approval)) {
        throw new Error("Requirement is not an approval transaction");
      }
    });
  });
});
