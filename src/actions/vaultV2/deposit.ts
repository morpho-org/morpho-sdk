import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  type RequirementSignature,
  type Transaction,
  type VaultV2DepositAction,
  ZeroAssetAmountError,
  ZeroMaxSharePriceError,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

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
    requirementSignature?: RequirementSignature;
  };
  metadata?: Metadata;
}

/**
 * Prepares a deposit transaction for the VaultV2 contract.
 *
 * This function constructs the transaction data required to deposit a specified amount of assets into the vault.
 * Bundler Integration: This flow uses the bundler to atomically execute the user's asset transfer and vault deposit in a single transaction for slippage protection.
 *
 * IMPORTANT FOR DEVELOPERS:
 * This deposit flow is routed through the general adapter in order to enforce a strict check on `maxSharePrice`.
 * This check is critical to prevent inflation attacks, especially for vaults where there is no "dead deposit" protection.
 * Do not bypass the general adapter or remove this check, as doing so would expose the flow to potential exploits.
 * The maxSharePrice constraint ensures that the user does not receive unfavorable share pricing due to malicious or sudden vault changes.
 *
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
 * @param {Object} params.args.requirementSignature - The requirement args and signature.
 * @param {Object} params.args.requirementSignature.args - The requirement signature arguments.
 * @param {Object} params.args.requirementSignature.action - The requirement signature action.
 * @param {Metadata} [params.metadata] - Optional the metadata.
 *
 * @returns {Readonly<Transaction<VaultV2DepositAction>>} The prepared deposit transaction.
 */
export const vaultV2Deposit = ({
  vault: { chainId, address: vaultAddress, asset },
  args: { assets, maxSharePrice, recipient, requirementSignature },
  metadata,
}: VaultV2DepositParams): Readonly<Transaction<VaultV2DepositAction>> => {
  if (assets === 0n) {
    throw new ZeroAssetAmountError(asset);
  }

  if (maxSharePrice === 0n) {
    throw new ZeroMaxSharePriceError(vaultAddress);
  }

  const actions: Action[] = [];

  if (requirementSignature) {
    actions.push(...getRequirementsAction({ chainId, requirementSignature }));
  } else {
    const { bundler3: { generalAdapter1 } } = getChainAddresses(chainId);

    actions.push({
      type: "erc20TransferFrom",
      args: [
        asset,
        assets,
        generalAdapter1,
        false,
      ],
    });
  }

  actions.push({
    type: "erc4626Deposit",
    args: [vaultAddress, assets, maxSharePrice, recipient, false],
  });

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "vaultV2Deposit",
      args: { vault: vaultAddress, assets, maxSharePrice, recipient },
    },
  });
};
