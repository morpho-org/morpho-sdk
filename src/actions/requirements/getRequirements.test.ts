import { type Address } from "viem";
import { mainnet } from "viem/chains";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getRequirements } from "./getRequirements";
import {
  ChainIdMismatchError,
  isRequirementApproval,
  isRequirementSignature,
} from "../../types";
import { getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import type { Client } from "viem";

// Mock fetchHolding
vi.mock("@morpho-org/blue-sdk-viem", () => ({
  fetchHolding: vi.fn(),
}));

import { fetchHolding } from "@morpho-org/blue-sdk-viem";

describe("getRequirements", () => {
  const {
    dai,
    usdc,
    wNative,
    permit2,
    bundler3: { generalAdapter1 },
  } = getChainAddresses(mainnet.id);

  const mockFrom: Address = "0x1234567890123456789012345678901234567890";
  const mockAmount = 1000000n;

  let mockClient: Client;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = {
      chain: {
        id: mainnet.id,
      },
    } as unknown as Client;
  });

  describe("ChainId validation", () => {
    test("should throw ChainIdMismatchError when chainId does not match", async () => {
      const clientWithWrongChain = {
        chain: {
          id: 137, // Polygon instead of mainnet
        },
      } as unknown as Client;

      await expect(
        getRequirements(
          clientWithWrongChain,
          {
            address: usdc,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          false
        )
      ).rejects.toThrow(new ChainIdMismatchError(137, mainnet.id));
    });
  });

  describe("Flow 1: supportSignature = false (classic approval)", () => {
    test("should return approval when allowance is less than amount", async () => {
      vi.mocked(fetchHolding).mockResolvedValue({
        erc20Allowances: {
          "bundler3.generalAdapter1": 500000n, // Less than mockAmount
          permit2: 0n,
        },
        erc2612Nonce: undefined,
        permit2BundlerAllowance: {
          amount: 0n,
          expiration: 0n,
          nonce: 0n,
        },
      });

      const requirements = await getRequirements(
        mockClient,
        {
          address: usdc,
          chainId: mainnet.id,
          args: { amount: mockAmount, from: mockFrom },
        },
        false
      );

      expect(requirements).toHaveLength(1);
      const approval = requirements[0];
      if (!isRequirementApproval(approval)) {
        throw new Error("Requirement is not an approval transaction");
      }
      expect(approval.action.type).toBe("erc20Approval");
      expect(approval.action.args.spender).toBe(generalAdapter1);
      expect(approval.action.args.amount).toBe(mockAmount);
    });

    test("should return empty array when allowance is sufficient", async () => {
      vi.mocked(fetchHolding).mockResolvedValue({
        erc20Allowances: {
          "bundler3.generalAdapter1": 2000000n, // More than mockAmount
          permit2: 0n,
        },
        erc2612Nonce: undefined,
        permit2BundlerAllowance: {
          amount: 0n,
          expiration: 0n,
          nonce: 0n,
        },
      });

      const requirements = await getRequirements(
        mockClient,
        {
          address: usdc,
          chainId: mainnet.id,
          args: { amount: mockAmount, from: mockFrom },
        },
        false
      );

      expect(requirements).toHaveLength(0);
    });
  });

  describe("supportSignature = true", () => {
    describe("Flow 2: Simple permit (EIP-2612)", () => {
      test("should return simple permit requirement when erc2612Nonce is defined", async () => {
        const erc2612Nonce = 5n;

        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 0n,
          },
          erc2612Nonce,
          permit2BundlerAllowance: {
            amount: 0n,
            expiration: 0n,
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: usdc,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        expect(requirements).toHaveLength(1);
        const permit = requirements[0];
        if (!isRequirementSignature(permit)) {
          throw new Error("Requirement is not a permit transaction");
        }
        expect(permit.action.type).toBe("permit");
        expect(permit.action.args.spender).toBe(generalAdapter1);
        expect(permit.action.args.amount).toBe(mockAmount);
      });

      test("should return empty array when allowance is sufficient", async () => {
        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 2000000n, // More than mockAmount
            permit2: 0n,
          },
          erc2612Nonce: 0n,
          permit2BundlerAllowance: {
            amount: 0n,
            expiration: 0n,
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: usdc,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        expect(requirements).toHaveLength(0);
      });

      test("should return simple permit when DAI (supports EIP-2612) and allowance is insufficient", async () => {
        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 0n,
          },
          erc2612Nonce: 0n,
          permit2BundlerAllowance: {
            amount: 0n,
            expiration: 0n,
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: dai,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        expect(requirements).toHaveLength(1);

        const permitDai = requirements[0];
        if (!isRequirementSignature(permitDai)) {
          throw new Error("Requirement is not a permit transaction");
        }
        expect(permitDai.action.type).toBe("permit");
        expect(permitDai.action.args.spender).toBe(generalAdapter1);
        expect(permitDai.action.args.amount).toBe(mockAmount);
      });
    });

    describe("Flow 3: Permit2", () => {
      test("should return permit2 requirement with prior approval for permit2", async () => {
        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 0n, // No permit2 allowance
          },
          erc2612Nonce: undefined, // No simple permit
          permit2BundlerAllowance: {
            amount: 0n, // No bundler allowance
            expiration: 0n, // Expired
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: wNative,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        // Should return permit2 approval + permit2 requirement
        expect(requirements.length).toBe(2);

        const approval = requirements[0];
        if (!isRequirementApproval(approval)) {
          throw new Error("Requirement is not an approval transaction");
        }
        expect(approval.action.type).toBe("erc20Approval");
        expect(approval.action.args.spender).toBe(permit2);
        expect(approval.action.args.amount).toBe(MathLib.MAX_UINT_160); // Always approve infinite.

        // Check for permit2 requirement
        const permit2Requirement = requirements[1];
        if (!isRequirementSignature(permit2Requirement)) {
          throw new Error("Requirement is not a requirement signature");
        }
        expect(permit2Requirement.action.type).toBe("permit2");
        expect(permit2Requirement.action.args.spender).toBe(permit2);
        expect(permit2Requirement.action.args.amount).toBe(mockAmount);
      });

      test("should return permit2 only when prior approval for permit2 is sufficient", async () => {
        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 2000000n, // Sufficient permit2 allowance
          },
          erc2612Nonce: undefined,
          permit2BundlerAllowance: {
            amount: 0n,
            expiration: 0n,
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: wNative,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        expect(requirements).toHaveLength(1);
        const permit2Requirement = requirements[0];
        if (!isRequirementSignature(permit2Requirement)) {
          throw new Error("Requirement is not a requirement signature");
        }
        expect(permit2Requirement.action.type).toBe("permit2");
        expect(permit2Requirement.action.args.spender).toBe(permit2);
        expect(permit2Requirement.action.args.amount).toBe(mockAmount);
      });

      test("should return empty array when permit2 allowance is sufficient and not expired", async () => {
        const currentTime = BigInt(Math.floor(Date.now() / 1000));

        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 2000000n, // Sufficient permit2 allowance
          },
          erc2612Nonce: undefined,
          permit2BundlerAllowance: {
            amount: 2000000n, // Sufficient amount
            expiration: currentTime + 10000n, // Not expired
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: wNative,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        // Should return empty array when everything is sufficient
        expect(requirements).toHaveLength(0);
      });

      test("should return permit2 requirement when expiration is expired", async () => {
        const currentTime = BigInt(Math.floor(Date.now() / 1000));
        const expiration = currentTime - 1000n;
        vi.mocked(fetchHolding).mockResolvedValue({
          erc20Allowances: {
            "bundler3.generalAdapter1": 0n,
            permit2: 2000000n, // Sufficient permit2 allowance
          },
          erc2612Nonce: undefined,
          permit2BundlerAllowance: {
            amount: 2000000n, // Sufficient amount
            expiration,
            nonce: 0n,
          },
        });

        const requirements = await getRequirements(
          mockClient,
          {
            address: wNative,
            chainId: mainnet.id,
            args: { amount: mockAmount, from: mockFrom },
          },
          true
        );

        expect(requirements).toHaveLength(1);
        const permit2Requirement = requirements[0];
        if (!isRequirementSignature(permit2Requirement)) {
          throw new Error("Requirement is not a requirement signature");
        }
        expect(permit2Requirement.action.type).toBe("permit2");
        expect(permit2Requirement.action.args.spender).toBe(permit2);
        expect(permit2Requirement.action.args.amount).toBe(mockAmount);
      });
    });
  });
});
