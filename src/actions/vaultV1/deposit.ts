import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze, isDefined } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  ChainWNativeMissingError,
  type DepositAmountArgs,
  type Metadata,
  NativeAmountOnNonWNativeVaultError,
  NegativeNativeAmountError,
  NonPositiveAssetAmountError,
  NonPositiveMaxSharePriceError,
  type RequirementSignature,
  type Transaction,
  type VaultV1DepositAction,
  ZeroDepositAmountError,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

export interface VaultV1DepositParams {
  vault: {
    chainId: number;
    address: Address;
    asset: Address;
  };
  args: DepositAmountArgs & {
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
 * When `nativeAmount` is provided, that amount of native ETH is sent as `msg.value`
 * to the Bundler3 multicall and wrapped into WETH via `GeneralAdapter1.wrapNative()`.
 * The vault's underlying asset must be the chain's wrapped native token (wNative).
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
 * @param {bigint} [params.args.nativeAmount] - Amount of native ETH to wrap into WETH for the deposit.
 * @param {Metadata} [params.metadata] - Optional analytics metadata.
 * @returns {Readonly<Transaction<VaultV1DepositAction>>} The prepared deposit transaction.
 */
export const vaultV1Deposit = ({
  vault: { chainId, address: vaultAddress, asset },
  args: {
    assets = 0n,
    maxSharePrice,
    recipient,
    requirementSignature,
    nativeAmount,
  },
  metadata,
}: VaultV1DepositParams): Readonly<Transaction<VaultV1DepositAction>> => {
  if (assets < 0n) {
    throw new NonPositiveAssetAmountError(asset);
  }

  if (maxSharePrice <= 0n) {
    throw new NonPositiveMaxSharePriceError(vaultAddress);
  }

  const actions: Action[] = [];

  const {
    bundler3: { generalAdapter1 },
    wNative,
  } = getChainAddresses(chainId);

  if (nativeAmount) {
    if (nativeAmount < 0n) {
      throw new NegativeNativeAmountError(nativeAmount);
    }

    if (!isDefined(wNative)) {
      throw new ChainWNativeMissingError(chainId);
    }
    if (asset !== wNative) {
      throw new NativeAmountOnNonWNativeVaultError(asset, wNative);
    }

    actions.push({
      type: "wrapNative",
      args: [nativeAmount, generalAdapter1, false /* skipRevert */],
    });
  }

  if (assets > 0n) {
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
      actions.push({
        type: "erc20TransferFrom",
        args: [asset, assets, generalAdapter1, false /* skipRevert */],
      });
    }
  }

  const totalAssets = assets + (nativeAmount ?? 0n);

  if (totalAssets === 0n) {
    throw new ZeroDepositAmountError(vaultAddress);
  }

  actions.push({
    type: "erc4626Deposit",
    args: [
      vaultAddress,
      totalAssets,
      maxSharePrice,
      recipient,
      false /* skipRevert */,
    ],
  });

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (nativeAmount) {
    tx = { ...tx, value: nativeAmount };
  }

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "vaultV1Deposit",
      args: {
        vault: vaultAddress,
        assets,
        maxSharePrice,
        recipient,
        nativeAmount,
      },
    },
  });
};
