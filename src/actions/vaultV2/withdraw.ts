import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import type { Metadata, Transaction } from "../../types";

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

export function withdrawVaultV2(
  params: VaultV2WithdrawParams,
): Readonly<Transaction> {
  Object.freeze(params);
  const { vault, assets, recipient, onBehalf, metadata } = params;

  let tx = {
    to: vault,
    data: encodeFunctionData({
      abi: vaultV2Abi,
      functionName: "withdraw",
      args: [assets, recipient, onBehalf],
    }),
    value: 0n,
  };

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return Object.freeze({
    ...tx,
    action: {
      type: "vaultV2Withdraw" as const,
      args: { vault, assets, recipient },
    },
  });
}
