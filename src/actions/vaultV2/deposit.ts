import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
} from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2DepositAction } from "../../types";

export interface VaultV2DepositParams {
  chainId: number;
  asset: Address;
  vault: Address;
  assets: bigint;
  shares: bigint;
  recipient: Address;
  metadata?: Metadata;
}

// I would prefer the foolowing signature:
// function vaultV2Deposit(
//   vault: Pick<VaultV2, "asset" | "address" | "chainID" | ...>,// the whole entity
//   args: {assets: bigint; recipient: Address;slippage?: bigint},
//   metadata?: Metadata
// ): Readonly<Transaction<VaultV2DepositAction>> {...}

// naming is inconsistent
// it should be named _vaultV2Deposit
function _depositVaultV2(
  params: VaultV2DepositParams, // I would destruct the params directly in the function signature here
): Readonly<Transaction<VaultV2DepositAction>> {
  Object.freeze(params);  // freezing is useless as you destruct the object
  const { chainId, asset, vault, assets, shares, recipient, metadata } = params;

  // Put an absolute max share price, we're using 100 RAY in sdk 
  const maxSharePrice = MathLib.mulDivUp(
    assets,
    MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE),
    shares,
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
    // Skimming assets tokens is not needed as we deposit everything that we transfer
    {
      type: "erc20Transfer",
      args: [asset, recipient, MathLib.MAX_UINT_256, generalAdapter1, false],
    },
  ];

  let tx = BundlerAction.encodeBundle(chainId, actions);

  // it would be cleaner to have addTransactionMetadata accept undefined metadata and thus avoid the `if (metadata)` everywhere
  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  const action: VaultV2DepositAction = {
    type: "vaultV2Deposit",
    args: { vault, assets, shares, recipient },
  };


  // I'm not sure we want to freeze the object here
  // In case we do, we should use `deepFreeze` from `@morpho-org/utils`
  return Object.freeze({
    ...tx,
    action,
  });
}

// You set telemetry name as "vaultV2.deposit" while depositVaultV2 could be used as a standalone function
export const depositVaultV2 = withTelemetry("depositVaultV2", _depositVaultV2);
