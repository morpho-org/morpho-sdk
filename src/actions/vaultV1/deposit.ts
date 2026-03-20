import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  NonPositiveAssetAmountError,
  NonPositiveMaxSharePriceError,
  type RequirementSignature,
  type Transaction,
  type VaultV1DepositAction,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

export interface VaultV1DepositParams {
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
 * Prepares a deposit transaction for a VaultV1 (MetaMorpho) contract.
 *
 * Routed through the bundler to atomically execute the asset transfer and vault deposit.
 * The general adapter enforces `maxSharePrice` on-chain to prevent inflation attacks.
 * Never bypass the general adapter.
 *
 * @param {Object} params - The deposit parameters.
 * @param {Object} params.vault - The vault identifiers.
 * @param {number} params.vault.chainId - The chain ID.
 * @param {Address} params.vault.address - The vault address.
 * @param {Address} params.vault.asset - The underlying ERC20 asset address.
 * @param {Object} params.args - The deposit arguments.
 * @param {bigint} params.args.assets - Amount of assets to deposit.
 * @param {bigint} params.args.maxSharePrice - Maximum acceptable share price (slippage protection).
 * @param {Address} params.args.recipient - Receives the vault shares.
 * @param {RequirementSignature} [params.args.requirementSignature] - Pre-signed permit/permit2 approval.
 * @param {Metadata} [params.metadata] - Optional analytics metadata.
 * @returns {Readonly<Transaction<VaultV1DepositAction>>} The prepared deposit transaction.
 */
export const vaultV1Deposit = ({
  vault: { chainId, address: vaultAddress, asset },
  args: { assets, maxSharePrice, recipient, requirementSignature },
  metadata,
}: VaultV1DepositParams): Readonly<Transaction<VaultV1DepositAction>> => {
  if (assets <= 0n) {
    throw new NonPositiveAssetAmountError(asset);
  }

  if (maxSharePrice <= 0n) {
    throw new NonPositiveMaxSharePriceError(vaultAddress);
  }

  const actions: Action[] = [];

  if (requirementSignature) {
    actions.push(
      ...getRequirementsAction({
        chainId,
        asset,
        assets,
        requirementSignature,
      }),
    );
  } else {
    const {
      bundler3: { generalAdapter1 },
    } = getChainAddresses(chainId);

    actions.push({
      type: "erc20TransferFrom",
      args: [asset, assets, generalAdapter1, false],
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
      type: "vaultV1Deposit",
      args: { vault: vaultAddress, assets, maxSharePrice, recipient },
    },
  });
};
