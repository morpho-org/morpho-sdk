import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { trackAction } from "../../telemetry";
import type { Metadata, Transaction, VaultV2WithdrawAction } from "../../types";

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

export function withdrawVaultV2(
  params: VaultV2WithdrawParams,
): Readonly<Transaction<VaultV2WithdrawAction>> {
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

  trackAction("vaultV2Withdraw");
  
  const action: VaultV2WithdrawAction = {
    type: "vaultV2Withdraw",
    args: { vault, assets, recipient },
  };

  return Object.freeze({
    ...tx,
    action,
  });
}
