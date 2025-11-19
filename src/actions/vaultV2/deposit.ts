import { getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
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

export const vaultV2Deposit = ({
  vault: { chainId, address: vaultAddress, asset },
  args: { assets, maxSharePrice, recipient },
  metadata,
}: VaultV2DepositParams): Readonly<Transaction<VaultV2DepositAction>> => {
  if (assets === 0n) {
    throw new ZeroAssetAmountError();
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
