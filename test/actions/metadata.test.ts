import { createMorphoClient, Time } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Metadata", () => {
  test("should create deposit bundle with origin and timestamp metadata", async ({
    client,
  }) => {
    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: KeyrockUsdcVaultV2.asset,
      amount: amount,
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
        const morpho = createMorphoClient(client, {
          origin: "25AFEA44",
          timestamp: true,
        });
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const deposit = await vaultV2.prepareDeposit({
          assets: amount,
        });

        expect(deposit.tx.data).toContain("25AFEA44");
        const position = deposit.tx.data.indexOf("25AFEA44");
        expect(position).toBeGreaterThanOrEqual(8);

        const timestampHex = deposit.tx.data.slice(position - 8, position);
        expect(timestampHex).toMatch(/^[0-9a-fA-F]{8}$/);
        const timestampNumber = parseInt(timestampHex, 16);
        expect(typeof timestampNumber).toBe("number");
        expect(timestampNumber).toBeLessThanOrEqual(Number(Time.timestamp()));

        const requirements = await deposit.getRequirements();

        const approveTx = requirements[0];
        if (!approveTx) {
          throw new Error("Approve transaction not found");
        }

        await client.sendTransaction(approveTx);
        await client.sendTransaction(deposit.tx);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance
    );
  });

  test("should not generate timestamp metadata if timestamp is not provided", async ({
    client,
  }) => {
    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: KeyrockUsdcVaultV2.asset,
      amount: amount,
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
        const morpho = createMorphoClient(client, {
          origin: "25AFEA44",
        });
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address);
        const deposit = await vaultV2.prepareDeposit({
          assets: amount,
        });

        expect(deposit.tx.data).toContain("25AFEA44");
        const position = deposit.tx.data.indexOf("25AFEA44");
        expect(position).toBeGreaterThanOrEqual(8);

        const timestampHex = deposit.tx.data.slice(position - 8, position);
        expect(timestampHex).toBe("00000000");

        const requirements = await deposit.getRequirements();

        const approveTx = requirements[0];
        if (!approveTx) {
          throw new Error("Approve transaction not found");
        }

        await client.sendTransaction(approveTx);
        await client.sendTransaction(deposit.tx);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance
    );
  });
});
