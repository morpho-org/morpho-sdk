import { addressesRegistry } from "@morpho-org/blue-sdk";
import type { Address } from "viem";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, vi } from "vitest";
import {
  KeyrockUsdcVaultV2,
  KpkWETHVaultV2,
} from "../../../test/fixtures/vaultV2";
import { test } from "../../../test/setup";
import {
  DepositAmountMismatchError,
  isRequirementApproval,
  isRequirementSignature,
} from "../../types";
import { getRequirements } from "../requirements";
import * as getRequirementsActionModule from "../requirements/getRequirementsAction";
import { vaultV2Deposit } from "./deposit";

describe("depositVaultV2 unit tests", () => {
  const { dai, usdc, wNative } = addressesRegistry[mainnet.id];

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

  test("should create deposit bundle with USDC via simple permit", async ({
    client,
  }) => {
    const assets = parseUnits("1000", 6); // 1000 USDC
    const maxSharePrice = 1000000n;

    const requirements = await getRequirements(client, {
      address: usdc,
      chainId: mainnet.id,
      supportSignature: true,
      useSimplePermit: true,
      args: {
        amount: assets,
        from: client.account.address,
      },
    });

    const permit2Requirement = requirements[0];
    if (!isRequirementSignature(permit2Requirement)) {
      throw new Error("Permit2 requirement not found");
    }

    const requirementSignature = await permit2Requirement.sign(
      client,
      client.account.address,
    );

    expect(requirementSignature.args.asset).toEqual(usdc);

    const localSpy = vi.spyOn(
      getRequirementsActionModule,
      "getRequirementsAction",
    );

    const tx = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: KeyrockUsdcVaultV2.address,
        asset: usdc,
      },
      args: {
        assets,
        maxSharePrice,
        recipient: client.account.address,
        requirementSignature,
      },
    });

    expect(localSpy).toHaveBeenCalled();

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Deposit");
    expect(tx.action.args.vault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.maxSharePrice).toBe(maxSharePrice);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create deposit bundle with WETH via permit2", async ({
    client,
  }) => {
    const assets = parseUnits("5", 18); // 5 WETH
    const maxSharePrice = 1000000000000000000n;

    const requirements = await getRequirements(client, {
      address: wNative,
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

    expect(requirementSignature.args.asset).toEqual(wNative);

    const tx = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: KpkWETHVaultV2.address,
        asset: wNative,
      },
      args: {
        assets,
        maxSharePrice,
        recipient: client.account.address,
        requirementSignature,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Deposit");
    expect(tx.action.args.vault).toBe(KpkWETHVaultV2.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.maxSharePrice).toBe(maxSharePrice);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should throw when signature amount does not match deposit amount", async ({
    client,
  }) => {
    const signatureAmount = parseUnits("5000", 6);
    const depositAmount = parseUnits("1000", 6);
    const maxSharePrice = 1000000n;

    const requirements = await getRequirements(client, {
      address: usdc,
      chainId: mainnet.id,
      supportSignature: true,
      useSimplePermit: true,
      args: {
        amount: signatureAmount,
        from: client.account.address,
      },
    });

    const permit2Requirement = requirements[0];
    if (!isRequirementSignature(permit2Requirement)) {
      throw new Error("Permit2 requirement not found");
    }

    const requirementSignature = await permit2Requirement.sign(
      client,
      client.account.address,
    );

    expect(() =>
      vaultV2Deposit({
        vault: {
          chainId: mainnet.id,
          address: KeyrockUsdcVaultV2.address,
          asset: usdc,
        },
        args: {
          assets: depositAmount,
          maxSharePrice,
          recipient: client.account.address,
          requirementSignature,
        },
      }),
    ).toThrow(DepositAmountMismatchError);
  });

  test("should create deposit bundle without requirement signature", async ({
    client,
  }) => {
    const assets = parseUnits("500", 6); // 500 USDC
    const maxSharePrice = 1000000n;

    const localSpy = vi.spyOn(
      getRequirementsActionModule,
      "getRequirementsAction",
    );

    const tx = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: KeyrockUsdcVaultV2.address,
        asset: usdc,
      },
      args: {
        assets,
        maxSharePrice,
        recipient: client.account.address,
      },
    });

    expect(localSpy).not.toHaveBeenCalled();

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2Deposit");
    expect(tx.action.args.vault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.assets).toBe(assets);
    expect(tx.action.args.maxSharePrice).toBe(maxSharePrice);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });
});
