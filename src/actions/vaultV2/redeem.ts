import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  type Transaction,
  type VaultV2RedeemAction,
  ZeroSharesAmountError,
} from "../../types";

export interface VaultV2RedeemParams {
  vault: {
    address: Address;
  };
  args: {
    shares: bigint;
    recipient: Address;
    onBehalf: Address;
  };
  metadata?: Metadata;
}

export const vaultV2Redeem = ({
  vault: { address: vaultAddress },
  args: { shares, recipient, onBehalf },
  metadata,
}: VaultV2RedeemParams): Readonly<Transaction<VaultV2RedeemAction>> => {
  if (shares === 0n) {
    throw new ZeroSharesAmountError();
  }

  let tx = {
    to: vaultAddress,
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
    args: { vault: vaultAddress, shares, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
};
