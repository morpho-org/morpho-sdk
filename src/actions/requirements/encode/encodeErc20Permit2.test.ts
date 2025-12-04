import { type Address, isHex } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../../../../test/setup";
import { encodeErc20Permit2 } from "./encodeErc20Permit2";
import {
  AddressMismatchError,
  MissingClientPropertyError,
} from "../../../types";
import { addressesRegistry, MathLib } from "@morpho-org/blue-sdk";

describe("encodeErc20Permit2", () => {
  const { usdc, bundler3: { generalAdapter1 } } =  addressesRegistry[mainnet.id];

  const mockAmount = 1000000n;
  const mockNonce = 0n;
  const mockExpiration = MathLib.MAX_UINT_48;

  describe("sign", () => {
    test("should sign permit2 for token", async ({ client }) => {
      const userAddress = client.account.address;

      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      const signatureArgs = await permit.sign(client, userAddress);

      expect(signatureArgs.owner).toEqual(userAddress);
      expect(isHex(signatureArgs.signature)).toBe(true);
      expect(signatureArgs.signature.length).toBe(132);
    });

    test("should throw error if client account is missing", async ({
      client,
    }) => {
      const clientWithoutAccount = {
        ...client,
        account: null,
      } as unknown as typeof client;

      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      await expect(
        permit.sign(clientWithoutAccount, client.account.address)
      ).rejects.toThrow(new MissingClientPropertyError("client.account"));
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

      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      await expect(
        permit.sign(clientWithoutSignTypedData, client.account.address)
      ).rejects.toThrow(
        new MissingClientPropertyError("client.account.signTypedData")
      );
    });

    test("should throw error if client account address does not match user address", async ({
      client,
    }) => {
      const differentAddress: Address =
        "0x0000000000000000000000000000000000000001";

      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      await expect(permit.sign(client, differentAddress)).rejects.toThrow(
        new AddressMismatchError(client.account.address, differentAddress)
      );
    });

    test("should return all expected properties in signature args", async ({
      client,
    }) => {
      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      const signatureArgs = await permit.sign(client, client.account.address);

      expect(signatureArgs).toHaveProperty("owner");
      expect(signatureArgs).toHaveProperty("signature");
      expect(signatureArgs).toHaveProperty("deadline");
      expect(signatureArgs).toHaveProperty("amount");
      expect(signatureArgs).toHaveProperty("asset");
      expect(signatureArgs).toHaveProperty("nonce");
      expect(signatureArgs).toHaveProperty("expiration");
      expect(signatureArgs.owner).toEqual(client.account.address);
      expect(signatureArgs.amount).toEqual(mockAmount);
      expect(signatureArgs.asset).toEqual(usdc);
      expect(signatureArgs.nonce).toEqual(mockNonce);

      if (!("expiration" in signatureArgs)) {
        throw new Error("Expiration is not defined");
      }
      expect(signatureArgs.expiration).toEqual(mockExpiration);
    });

    test("should set deadline to approximately 2 hours in the future", async ({
      client,
    }) => {
      const now = BigInt(Math.floor(Date.now() / 1000));

      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      const signatureArgs = await permit.sign(client, client.account.address);

      // Deadline should be approximately 2 hours (7200 seconds) in the future
      // Allow 5 seconds tolerance for test execution time
      const expectedDeadline = now + 7200n;
      const tolerance = 5n;

      expect(signatureArgs.deadline).toBeGreaterThan(now);
      expect(signatureArgs.deadline).toBeGreaterThanOrEqual(
        expectedDeadline - tolerance
      );
      expect(signatureArgs.deadline).toBeLessThanOrEqual(
        expectedDeadline + tolerance
      );
    });

    test("should have correct action structure", async () => {
      const permit = encodeErc20Permit2({
        token: usdc,
        spender: generalAdapter1,
        amount: mockAmount,
        chainId: mainnet.id,
        nonce: mockNonce,
        expiration: mockExpiration,
      });

      if (permit.action.type !== "permit2") {
        throw new Error("Permit action type is not permit2");
      }

      expect(permit.action.type).toBe("permit2");
      expect(permit.action.args).toHaveProperty("spender");
      expect(permit.action.args).toHaveProperty("amount");
      expect(permit.action.args).toHaveProperty("deadline");
      expect(permit.action.args).toHaveProperty("expiration");
      expect(permit.action.args.spender).toEqual(generalAdapter1);
      expect(permit.action.args.amount).toEqual(mockAmount);
      expect(permit.action.args.expiration).toEqual(mockExpiration);
    });
  });
});

