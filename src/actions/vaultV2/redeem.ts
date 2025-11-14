import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2RedeemAction } from "../../types";
import { deepFreeze } from "@morpho-org/morpho-ts";

export interface VaultV2RedeemParams {
  vault: Address;
  shares: bigint;
  recipient: Address;
  onBehalf: Address;
  metadata?: Metadata;
}

function _vaultV2Redeem(
  params: VaultV2RedeemParams
): Readonly<Transaction<VaultV2RedeemAction>> {
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

  const action: VaultV2RedeemAction = {
    type: "vaultV2Redeem",
    args: { vault, shares, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
}

export const vaultV2Redeem = withTelemetry("vaultV2.redeem", _vaultV2Redeem);
