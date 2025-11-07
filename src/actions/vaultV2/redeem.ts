import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2RedeemAction } from "../../types";


// MOST OF THE COMMENTS ON `deposit.ts` ALSO APPLY IN THIS FILE

export interface VaultV2RedeemParams {
  vault: Address;
  shares: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

function _redeemVaultV2(
  params: VaultV2RedeemParams,
): Readonly<Transaction<VaultV2RedeemAction>> {
  Object.freeze(params);
  const { vault, shares, recipient, onBehalf, metadata } = params;

  // on the long term we want to go through the bundler for slippage protection no?

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

  const action: VaultV2RedeemAction = {
    type: "vaultV2Redeem",
    args: { vault, shares, recipient },
  };

  return Object.freeze({
    ...tx,
    action,
  });
}

export const redeemVaultV2 = withTelemetry("vaultV2.redeem", _redeemVaultV2);
