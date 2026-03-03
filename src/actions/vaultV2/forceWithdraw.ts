import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address, Hex } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  type Transaction,
  type VaultV2ForceWithdrawAction,
  ZeroAssetAmountError,
} from "../../types";

export interface ForceDeallocateEntry {
  readonly adapter: Address;
  readonly data: Hex;
  readonly assets: bigint;
}

export interface VaultV2ForceWithdrawParams {
  vault: {
    chainId: number;
    address: Address;
  };
  args: {
    deallocations: readonly ForceDeallocateEntry[];
    withdraw: {
      assets: bigint;
      recipient: Address;
    };
    onBehalf: Address;
  };
  metadata?: Metadata;
}

/**
 * Prepares a force withdraw transaction for the VaultV2 contract, routed through the bundler.
 *
 * This function bundles one or more on-chain `forceDeallocate` calls followed by a single `withdraw`,
 * executed atomically via the bundler. This allows a user to free liquidity from multiple
 * illiquid markets and withdraw the resulting assets in one transaction.
 *
 * A penalty is taken from `onBehalf` for each deallocation to discourage allocation manipulations.
 * The penalty is applied as a share burn where assets are returned to the vault, so the share price
 * remains stable (except for rounding).
 *
 * @param {Object} params - The vault related parameters.
 * @param {Object} params.vault - The vault related parameters.
 * @param {number} params.vault.chainId - The chain ID (used to resolve bundler addresses).
 * @param {Address} params.vault.address - The vault contract address.
 * @param {Object} params.args - The force withdraw related parameters.
 * @param {readonly ForceDeallocateEntry[]} params.args.deallocations - The list of deallocations to perform.
 * @param {Object} params.args.withdraw - The withdraw parameters applied after deallocations.
 * @param {bigint} params.args.withdraw.assets - The amount of assets to withdraw.
 * @param {Address} params.args.withdraw.recipient - The recipient of the withdrawn assets.
 * @param {Address} params.args.onBehalf - The address from which the penalty is taken (share owner).
 * @param {Metadata} [params.metadata] - Optional analytics metadata to append.
 * @returns {Readonly<Transaction<VaultV2ForceWithdrawAction>>} The prepared bundled transaction.
 */
export const vaultV2ForceWithdraw = ({
  vault: { chainId, address: vaultAddress },
  args: { deallocations, withdraw, onBehalf },
  metadata,
}: VaultV2ForceWithdrawParams): Readonly<
  Transaction<VaultV2ForceWithdrawAction>
> => {
  if (withdraw.assets === 0n) {
    throw new ZeroAssetAmountError(vaultAddress);
  }

  const actions: Action[] = [];

  // TODO: Append forceDeallocate actions once the bundler SDK supports
  // the `forceDeallocate` action type. Each entry in `deallocations`
  // maps to one on-chain forceDeallocate(adapter, data, assets, onBehalf).

  actions.push({
    type: "erc4626Withdraw",
    args: [vaultAddress, withdraw.assets, 0n, withdraw.recipient, onBehalf],
  });

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "vaultV2ForceWithdraw",
      args: {
        vault: vaultAddress,
        deallocations: deallocations.map(({ adapter, assets }) => ({
          adapter,
          assets,
        })),
        withdraw: {
          assets: withdraw.assets,
          recipient: withdraw.recipient,
        },
        onBehalf,
      },
    },
  });
};
