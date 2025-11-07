import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2WithdrawAction } from "../../types";


// MOST OF THE COMMENTS ON `deposit.ts` ALSO APPLY IN THIS FILE

export interface VaultV2WithdrawParams {
  vault: Address;
  assets: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

function _withdrawVaultV2(
  params: VaultV2WithdrawParams,
): Readonly<Transaction<VaultV2WithdrawAction>> {
  Object.freeze(params);
  const { vault, assets, recipient, onBehalf, metadata } = params;

    // on the long term we want to go through the bundler for slippage protection no?

    
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

  return Object.freeze({
    ...tx,
    action,
  });
}

export const withdrawVaultV2 = withTelemetry(
  "vaultV2.withdraw",
  _withdrawVaultV2,
);
