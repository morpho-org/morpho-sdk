import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2WithdrawAction } from "../../types";
import { deepFreeze } from "@morpho-org/morpho-ts";

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

function _vaultV2Withdraw(
  params: VaultV2WithdrawParams
): Readonly<Transaction<VaultV2WithdrawAction>> {
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

  const action: VaultV2WithdrawAction = {
    type: "vaultV2Withdraw",
    args: { vault, assets, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
}

export const vaultV2Withdraw = withTelemetry(
  "vaultV2.withdraw",
  _vaultV2Withdraw
);
