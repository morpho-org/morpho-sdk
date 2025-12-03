import { type Address, isHex } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../../../test/setup";
import { encodeErc20Permit } from "./encodeErc20Permit";

describe("encodeErc20Permit", () => {
  const mockChainId = mainnet.id;
  const daiAddress: Address = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const usdcAddress: Address = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const mockSpender: Address = "0x1234567890123456789012345678901234567890";
  const mockAmount = 1000000n;
  const mockNonce = 0n;

  describe("sign", () => {
    test("should sign permit for non-DAI token", async ({ client }) => {
      const userAddress = client.account.address;

      const permit = encodeErc20Permit({
        token: usdcAddress,
        spender: mockSpender,
        amount: mockAmount,
        chainId: mockChainId,
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
        token: daiAddress,
        spender: mockSpender,
        amount: mockAmount,
        chainId: mockChainId,
        nonce: mockNonce,
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

      const permit = encodeErc20Permit({
        token: usdcAddress,
        spender: mockSpender,
        amount: mockAmount,
        chainId: mockChainId,
        nonce: mockNonce,
      });

      await expect(
        permit.sign(clientWithoutAccount, client.account.address),
      ).rejects.toThrow("Client missing account or signTypedData method");
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
        token: usdcAddress,
        spender: mockSpender,
        amount: mockAmount,
        chainId: mockChainId,
        nonce: mockNonce,
      });

      await expect(
        permit.sign(clientWithoutSignTypedData, client.account.address),
      ).rejects.toThrow("Client missing account or signTypedData method");
    });

    test("should throw error if client account address does not match user address", async ({
      client,
    }) => {
      const differentAddress =
        "0x0000000000000000000000000000000000000001" as Address;

      const permit = encodeErc20Permit({
        token: usdcAddress,
        spender: mockSpender,
        amount: mockAmount,
        chainId: mockChainId,
        nonce: mockNonce,
      });

      await expect(permit.sign(client, differentAddress)).rejects.toThrow(
        "Client account address does not match user address",
      );
    });
  });
});
