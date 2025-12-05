import { addressesRegistry } from "@morpho-org/blue-sdk";
import { Time } from "@morpho-org/morpho-ts";
import { type Address, isHex } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../../../../test/setup";
import {
  AddressMismatchError,
  MissingClientPropertyError,
} from "../../../types";
import { encodeErc20Permit } from "./encodeErc20Permit";

describe("encodeErc20Permit", () => {
  const {
    usdc,
    dai,
    bundler3: { generalAdapter1 },
  } = addressesRegistry[mainnet.id];

  const mockAmount = 1000000n;
  const mockNonce = 0n;

  describe("sign", () => {
    test("should sign permit for non-DAI token", async ({ client }) => {
      const userAddress = client.account.address;

      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      const signatureArgs = await permit.sign(client, userAddress);

      expect(signatureArgs.owner).toEqual(userAddress);
      expect(isHex(signatureArgs.signature)).toBe(true);
      expect(signatureArgs.signature.length).toBe(132);
    });

    test("should sign permit for DAI token", async ({ client }) => {
      const userAddress = client.account.address;

      const permit = encodeErc20Permit({
        token: dai,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      const signatureArgs = await permit.sign(client, userAddress);

      expect(signatureArgs.owner).toEqual(userAddress);
      expect(isHex(signatureArgs.signature)).toBe(true);
      expect(signatureArgs.signature.length).toBe(132);
    });

    test("should throw error if client account signTypedData is missing", async ({
      client,
    }) => {
      const clientWithoutSignTypedData = {
        ...client,
        account: {
          ...client.account,
          signTypedData: undefined,
        },
      } as unknown as typeof client;

      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      await expect(
        permit.sign(clientWithoutSignTypedData, client.account.address),
      ).rejects.toThrow(
        new MissingClientPropertyError("client.account.signTypedData"),
      );
    });

    test("should throw error if client account address does not match user address", async ({
      client,
    }) => {
      const differentAddress =
        "0x0000000000000000000000000000000000000001" as Address;

      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      await expect(permit.sign(client, differentAddress)).rejects.toThrow(
        new AddressMismatchError(client.account.address, differentAddress),
      );
    });

    test("should return all expected properties in signature args", async ({
      client,
    }) => {
      const userAddress = client.account.address;

      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      const signatureArgs = await permit.sign(client, userAddress);

      expect(signatureArgs).toHaveProperty("owner");
      expect(signatureArgs).toHaveProperty("signature");
      expect(signatureArgs).toHaveProperty("deadline");
      expect(signatureArgs).toHaveProperty("amount");
      expect(signatureArgs).toHaveProperty("asset");
      expect(signatureArgs).toHaveProperty("nonce");
      expect(signatureArgs.owner).toEqual(userAddress);
      expect(signatureArgs.amount).toEqual(mockAmount);
      expect(signatureArgs.asset).toEqual(usdc);
      expect(signatureArgs.nonce).toEqual(mockNonce);
    });

    test("should set deadline to approximately 2 hours in the future", async ({
      client,
    }) => {
      const userAddress = client.account.address;
      const now = Time.timestamp();

      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      const signatureArgs = await permit.sign(client, userAddress);

      // Deadline should be approximately 2 hours (7200 seconds) in the future
      // Allow 5 seconds tolerance for test execution time
      const expectedDeadline = now + 7200n;
      const tolerance = 5n;

      expect(signatureArgs.deadline).toBeGreaterThan(now);
      expect(signatureArgs.deadline).toBeGreaterThanOrEqual(
        expectedDeadline - tolerance,
      );
      expect(signatureArgs.deadline).toBeLessThanOrEqual(
        expectedDeadline + tolerance,
      );
    });

    test("should have correct action structure", async () => {
      const permit = encodeErc20Permit({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
      });

      expect(permit.action.type).toBe("permit");
      expect(permit.action.args).toHaveProperty("spender");
      expect(permit.action.args).toHaveProperty("amount");
      expect(permit.action.args).toHaveProperty("deadline");
      expect(permit.action.args.spender).toEqual(generalAdapter1);
      expect(permit.action.args.amount).toEqual(mockAmount);
    });
  });
});
