import { Address, encodeFunctionData } from "viem";
import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { Transaction, Metadata } from "../../types";
import { addTransactionMetadata } from "../../helpers";
import { deepFreeze } from "@morpho-org/morpho-ts";

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

export function withdrawVaultV2({
  vault,
  assets,
  recipient,
  onBehalf,
  metadata,
}: VaultV2WithdrawParams): Transaction {
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

  return deepFreeze({
    ...tx,
    action: {
      type: "vaultV2Withdraw",
      args: { vault, assets, recipient },
    },
  });
}
