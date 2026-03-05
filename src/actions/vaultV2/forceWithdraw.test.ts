import { MarketParams } from "@morpho-org/blue-sdk";
import { getAddress, isHex, parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "../../../test/setup";
import {
  EmptyDeallocationsError,
  WithdrawExceedsDeallocationsError,
  ZeroAssetAmountError,
} from "../../types";
import { vaultV2ForceWithdraw } from "./forceWithdraw";

describe("forceWithdrawVaultV2 unit tests", () => {
  const mockVaultAddress = getAddress(
    "0x0000000000000000000000000000000000000001",
  );
  const mockAdapterAddress = getAddress(
    "0x0000000000000000000000000000000000000002",
  );
  const mockAdapterAddress2 = getAddress(
    "0x0000000000000000000000000000000000000003",
  );

  const mockMarketParams = new MarketParams({
    loanToken: getAddress("0x000000000000000000000000000000000000000A"),
    collateralToken: getAddress("0x000000000000000000000000000000000000000B"),
    oracle: getAddress("0x000000000000000000000000000000000000000C"),
    irm: getAddress("0x000000000000000000000000000000000000000D"),
    lltv: parseUnits("0.8", 18),
  });

  test("should create force withdraw tx with a single deallocation (with marketParams)", ({
    client,
  }) => {
    const assets = parseUnits("100", 18);

    const tx = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [
          {
            adapter: mockAdapterAddress,
            marketParams: mockMarketParams,
            assets,
          },
        ],
        withdraw: { assets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2ForceWithdraw");
    expect(tx.action.args.vault).toBe(mockVaultAddress);
    expect(tx.action.args.deallocations).toHaveLength(1);
    expect(tx.action.args.deallocations[0]?.adapter).toBe(mockAdapterAddress);
    expect(tx.action.args.deallocations[0]?.assets).toBe(assets);
    expect(tx.action.args.withdraw.assets).toBe(assets);
    expect(tx.action.args.withdraw.recipient).toBe(client.account.address);
    expect(tx.action.args.onBehalf).toBe(client.account.address);
    expect(tx.to).toBe(mockVaultAddress);
    expect(isHex(tx.data)).toBe(true);
    expect(tx.value).toBe(0n);
  });

  test("should create force withdraw tx with a single deallocation (without marketParams)", ({
    client,
  }) => {
    const assets = parseUnits("50", 6);

    const tx = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [{ adapter: mockAdapterAddress, assets }],
        withdraw: { assets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2ForceWithdraw");
    expect(tx.action.args.deallocations).toHaveLength(1);
    expect(tx.action.args.deallocations[0]?.marketParams).toBeUndefined();
    expect(tx.action.args.withdraw.assets).toBe(assets);
    expect(tx.to).toBe(mockVaultAddress);
    expect(isHex(tx.data)).toBe(true);
    expect(tx.value).toBe(0n);
  });

  test("should create force withdraw tx with multiple deallocations", ({
    client,
  }) => {
    const assets1 = parseUnits("60", 18);
    const assets2 = parseUnits("40", 18);
    const withdrawAssets = parseUnits("100", 18);

    const tx = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [
          {
            adapter: mockAdapterAddress,
            marketParams: mockMarketParams,
            assets: assets1,
          },
          { adapter: mockAdapterAddress2, assets: assets2 },
        ],
        withdraw: { assets: withdrawAssets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV2ForceWithdraw");
    expect(tx.action.args.deallocations).toHaveLength(2);
    expect(tx.action.args.deallocations[0]?.adapter).toBe(mockAdapterAddress);
    expect(tx.action.args.deallocations[0]?.assets).toBe(assets1);
    expect(tx.action.args.deallocations[1]?.adapter).toBe(mockAdapterAddress2);
    expect(tx.action.args.deallocations[1]?.assets).toBe(assets2);
    expect(tx.action.args.withdraw.assets).toBe(withdrawAssets);
    expect(tx.to).toBe(mockVaultAddress);
    expect(isHex(tx.data)).toBe(true);
    expect(tx.value).toBe(0n);
  });

  test("should allow withdraw less than total deallocated", ({ client }) => {
    const deallocatedAssets = parseUnits("100", 18);
    const withdrawAssets = parseUnits("50", 18);

    const tx = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [
          {
            adapter: mockAdapterAddress,
            marketParams: mockMarketParams,
            assets: deallocatedAssets,
          },
        ],
        withdraw: { assets: withdrawAssets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.args.withdraw.assets).toBe(withdrawAssets);
  });

  test("should append metadata when provided", ({ client }) => {
    const assets = parseUnits("100", 18);

    const txWithout = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [
          {
            adapter: mockAdapterAddress,
            marketParams: mockMarketParams,
            assets,
          },
        ],
        withdraw: { assets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
    });

    const txWith = vaultV2ForceWithdraw({
      vault: { address: mockVaultAddress },
      args: {
        deallocations: [
          {
            adapter: mockAdapterAddress,
            marketParams: mockMarketParams,
            assets,
          },
        ],
        withdraw: { assets, recipient: client.account.address },
        onBehalf: client.account.address,
      },
      metadata: { origin: "test" },
    });

    expect(txWith.data.length).toBeGreaterThan(txWithout.data.length);
  });

  test("should throw EmptyDeallocationsError when deallocations is empty", ({
    client,
  }) => {
    expect(() =>
      vaultV2ForceWithdraw({
        vault: { address: mockVaultAddress },
        args: {
          deallocations: [],
          withdraw: {
            assets: parseUnits("100", 18),
            recipient: client.account.address,
          },
          onBehalf: client.account.address,
        },
      }),
    ).toThrow(EmptyDeallocationsError);
  });

  test("should throw ZeroAssetAmountError when withdraw assets is zero", ({
    client,
  }) => {
    expect(() =>
      vaultV2ForceWithdraw({
        vault: { address: mockVaultAddress },
        args: {
          deallocations: [
            { adapter: mockAdapterAddress, assets: parseUnits("100", 18) },
          ],
          withdraw: { assets: 0n, recipient: client.account.address },
          onBehalf: client.account.address,
        },
      }),
    ).toThrow(ZeroAssetAmountError);
  });

  test("should throw WithdrawExceedsDeallocationsError when withdraw exceeds total deallocated", ({
    client,
  }) => {
    const deallocatedAssets = parseUnits("50", 18);
    const withdrawAssets = parseUnits("100", 18);

    expect(() =>
      vaultV2ForceWithdraw({
        vault: { address: mockVaultAddress },
        args: {
          deallocations: [
            { adapter: mockAdapterAddress, assets: deallocatedAssets },
          ],
          withdraw: {
            assets: withdrawAssets,
            recipient: client.account.address,
          },
          onBehalf: client.account.address,
        },
      }),
    ).toThrow(WithdrawExceedsDeallocationsError);
  });
});
