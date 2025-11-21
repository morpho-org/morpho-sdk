import { vaultV2Abi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  type Transaction,
  type VaultV2WithdrawAction,
  ZeroAssetAmountError,
} from "../../types";

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

/**
 * Prepares a withdraw transaction for the VaultV2 contract.
 *
 * This function constructs the transaction data required to withdraw a specified amount of assets from the vault.
 *
 * @param {Object} params - The vault related parameters.
 * @param {Object} params.vault - The vault related parameters.
 * @param {Address} params.vault.address - The vault address.
 * @param {Object} params.args - The withdraw related parameters.
 * @param {bigint} params.args.assets - The amount of assets to withdraw.
 * @param {Address} params.args.recipient - The recipient address.
 * @param {Address} params.args.onBehalf - The address on behalf of which the withdraw is made.
 * @param {Metadata} [params.metadata] - Optional the metadata.
 * @returns {Readonly<Transaction<VaultV2WithdrawAction>>} The prepared withdraw transaction.
 */
export const vaultV2Withdraw = ({
  vault: { address: vaultAddress },
  args: { assets, recipient, onBehalf },
  metadata,
}: VaultV2WithdrawParams): Readonly<Transaction<VaultV2WithdrawAction>> => {
  if (assets === 0n) {
    throw new ZeroAssetAmountError();
  }

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
