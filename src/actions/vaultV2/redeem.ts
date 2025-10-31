import { Address, encodeFunctionData } from "viem";
import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { Transaction, Metadata } from "../../types";
import { addTransactionMetadata } from "../../helpers";

export interface VaultV2RedeemParams {
  vault: Address;
  shares: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

export function redeemVaultV2(
  params: VaultV2RedeemParams
): Readonly<Transaction> {
  Object.freeze(params);
  const { vault, shares, recipient, onBehalf, metadata } = params;

  let tx = {
    to: vault,
    data: encodeFunctionData({
      abi: vaultV2Abi,
      functionName: "redeem",
      args: [shares, recipient, onBehalf],
    }),
    value: 0n,
  };

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return Object.freeze({
    ...tx,
    action: {
      type: "vaultV2Redeem" as const,
      args: { vault, shares, recipient },
    },
  });
}
