import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
} from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import { withTelemetry } from "../../telemetry/wrapper";
import type { Metadata, Transaction, VaultV2DepositAction } from "../../types";

export interface VaultV2DepositParams {
  vault: {
    chainId: number;
    address: Address;
    asset: Address;
  };
  args: {
    assets: bigint;
    shares: bigint;
    recipient: Address;
  };
  metadata?: Metadata;
}

function _vaultV2Deposit({
  vault: { chainId, address: vaultAddress, asset },
  args: { assets, shares, recipient },
  metadata,
}: VaultV2DepositParams): Readonly<Transaction<VaultV2DepositAction>> {
  const maxSharePrice = MathLib.max(
    MathLib.mulDivUp(
      assets,
      MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE),
      shares,
    ),
    MathLib.RAY * 100n,
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
    args: { vault: vaultAddress, assets, shares, recipient },
  };

  return deepFreeze({
    ...tx,
    action,
  });
}

export const vaultV2Deposit = withTelemetry(_vaultV2Deposit);
