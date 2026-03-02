import { addressesRegistry } from "@morpho-org/blue-sdk";
import type { Address } from "viem";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../../../test/setup";
import { isRequirementApproval, isRequirementSignature } from "../../types";
import { getRequirements } from "../requirements";
import { vaultV2Deposit } from "./deposit";

describe("depositVaultV2 unit tests", () => {
  const { dai } = addressesRegistry[mainnet.id];
  test("should create deposit bundle with DAI via permit2", async ({
    client,
  }) => {
    // Use a mock vault address with DAI as asset
    const mockVaultAddress =
      "0x0000000000000000000000000000000000000001" as Address;
    const assets = parseUnits("100", 18); // 100 DAI
    const maxSharePrice = 1000000000000000000n; // 1:1 share price

    // Create DAI permit signature
    const requirements = await getRequirements(client, {
      address: dai,
      chainId: mainnet.id,
      supportSignature: true,
      args: {
        amount: assets,
        from: client.account.address,
      },
    });

    const approvalPermit2 = requirements[0];
    if (!isRequirementApproval(approvalPermit2)) {
      throw new Error("Approval requirement not found");
    }

    const permit2Requirement = requirements[1];
    if (!isRequirementSignature(permit2Requirement)) {
      throw new Error("Permit2 requirement not found");
    }

    const requirementSignature = await permit2Requirement.sign(
      client,
      client.account.address,
    );

    expect(requirementSignature.args.asset).toEqual(dai);

    // Create deposit transaction
    const tx = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: mockVaultAddress,
        asset: dai,
      },
      args: {
        assets,
        maxSharePrice,
        recipient: client.account.address,
        requirementSignature,
      },
    });

    // Verify transaction structure
    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Deposit");
    expect(tx.action.args.vault).toBe(mockVaultAddress);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.maxSharePrice).toBe(maxSharePrice);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });
});
