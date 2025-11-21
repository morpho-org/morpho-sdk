import { getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  MaxSharePriceError,
  type Metadata,
  type Transaction,
  type VaultV2DepositAction,
  ZeroAssetAmountError,
} from "../../types";

export interface VaultV2DepositParams {
  vault: {
    chainId: number;
    address: Address;
    asset: Address;
  };
  args: {
    assets: bigint;
    maxSharePrice: bigint;
    recipient: Address;
  };
  metadata?: Metadata;
}

/**
 * Prepares a deposit transaction for the VaultV2 contract.
 *
 * This function constructs the transaction data required to deposit a specified amount of assets into the vault.
 * Bundler Integration: This flow uses the bundler to atomically execute the user's asset transfer and vault deposit in a single transaction for slippage protection.
 *
 * @param {Object} params - The vault related parameters.
 * @param {Object} params.vault - The vault related parameters.
 * @param {number} params.vault.chainId - The chain ID.
 * @param {Address} params.vault.address - The vault address.
 * @param {Address} params.vault.asset - The vault asset address.
 * @param {Object} params.args - The deposit related parameters.
 * @param {bigint} params.args.assets - The amount of assets to deposit.
 * @param {bigint} params.args.maxSharePrice - The maximum share price to accept for the deposit.
 * @param {Address} params.args.recipient - The recipient address.
 * @param {Metadata} [params.metadata] - Optional the metadata.
 * @returns {Readonly<Transaction<VaultV2DepositAction>>} The prepared deposit transaction.
 */
export const vaultV2Deposit = ({
  vault: { chainId, address: vaultAddress, asset },
  args: { assets, maxSharePrice, recipient },
  metadata,
}: VaultV2DepositParams): Readonly<Transaction<VaultV2DepositAction>> => {
  if (assets === 0n) {
    throw new ZeroAssetAmountError();
  }

  if (maxSharePrice === 0n) {
    throw new MaxSharePriceError();
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const actions: Action[] = [
    {
      type: "erc20TransferFrom",
      args: [asset, assets, generalAdapter1, false],
    },
    {
      type: "erc4626Deposit",
      args: [vaultAddress, assets, maxSharePrice, recipient, false],
    },
    // To skim the shares tokens
    {
      type: "erc20Transfer",
      args: [
        vaultAddress,
        recipient,
        MathLib.MAX_UINT_256,
        generalAdapter1,
        false,
      ],
    },
  ];

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  const action: VaultV2DepositAction = {
    type: "vaultV2Deposit",
    args: { vault: vaultAddress, assets, maxSharePrice, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
};
