import { metaMorphoAbi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  type Transaction,
  type VaultV1WithdrawAction,
  ZeroAssetAmountError,
} from "../../types";

export interface VaultV1WithdrawParams {
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
 * Prepares a withdraw transaction for a VaultV1 (MetaMorpho) contract.
 *
 * Direct vault call — no bundler needed. Withdraw has no inflation attack surface.
 *
 * @param {Object} params - The withdraw parameters.
 * @param {Object} params.vault - The vault identifiers.
 * @param {Address} params.vault.address - The vault address.
 * @param {Object} params.args - The withdraw arguments.
 * @param {bigint} params.args.assets - Amount of assets to withdraw.
 * @param {Address} params.args.recipient - Receives the withdrawn assets.
 * @param {Address} params.args.onBehalf - Address whose shares are burned.
 * @param {Metadata} [params.metadata] - Optional analytics metadata.
 * @returns {Readonly<Transaction<VaultV1WithdrawAction>>} The prepared withdraw transaction.
 */
export const vaultV1Withdraw = ({
  vault: { address: vaultAddress },
  args: { assets, recipient, onBehalf },
  metadata,
}: VaultV1WithdrawParams): Readonly<Transaction<VaultV1WithdrawAction>> => {
  if (assets === 0n) {
    throw new ZeroAssetAmountError(vaultAddress);
  }

  let tx = {
    to: vaultAddress,
    data: encodeFunctionData({
      abi: metaMorphoAbi,
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
      type: "vaultV1Withdraw",
      args: { vault: vaultAddress, assets, recipient },
    },
  });
};
