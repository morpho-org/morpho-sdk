import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import type { Metadata, Transaction, VaultV2WithdrawAction } from "../../types";

export interface VaultV2WithdrawParams {
  vault: {
    address: Address;
  };
  args: {
    assets: bigint;
    recipient: Address;
    onBehalf: Address;
  };
  metadata?: Metadata;
}

export const vaultV2Withdraw = ({
  vault: { address: vaultAddress },
  args: { assets, recipient, onBehalf },
  metadata,
}: VaultV2WithdrawParams): Readonly<Transaction<VaultV2WithdrawAction>> => {
  let tx = {
    to: vaultAddress,
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
    args: { vault: vaultAddress, assets, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
};
