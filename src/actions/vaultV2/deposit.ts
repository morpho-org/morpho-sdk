import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
} from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import type { Metadata, Transaction } from "../../types";

export interface VaultV2DepositParams {
  chainId: number;
  asset: Address;
  vault: Address;
  assets: bigint;
  shares: bigint;
  recipient: Address;
  metadata?: Metadata;
}

export function depositVaultV2(
  params: VaultV2DepositParams
): Readonly<Transaction> {
  Object.freeze(params);
  const { chainId, asset, vault, assets, shares, recipient, metadata } = params;

  const maxSharePrice = MathLib.mulDivUp(
    assets,
    MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE),
    shares
  );

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
      args: [vault, assets, maxSharePrice, recipient, false],
    },
    // To skim the shares tokens
    {
      type: "erc20Transfer",
      args: [vault, recipient, MathLib.MAX_UINT_256, generalAdapter1, false],
    },
    // To skim the assets tokens
    {
      type: "erc20Transfer",
      args: [asset, recipient, MathLib.MAX_UINT_256, generalAdapter1, false],
    },
  ];

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return Object.freeze({
    ...tx,
    action: {
      type: "vaultV2Deposit" as const,
      args: { vault, assets, shares, recipient },
    },
  });
}
