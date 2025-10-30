import { Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
} from "@morpho-org/blue-sdk";
import { Address } from "viem";
import { Transaction } from "../../types/action";

export interface VaultV2DepositParams {
  chainId: number;
  asset: Address;
  vault: Address;
  assets: bigint;
  shares: bigint;
  recipient: Address;
}

export function depositVaultV2({
  chainId,
  asset,
  vault,
  assets,
  shares,
  recipient,
}: VaultV2DepositParams): Transaction {
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

  const tx = BundlerAction.encodeBundle(chainId, actions);

  return {
    ...tx,
    action: {
      type: "vaultV2Deposit",
      args: { vault, assets, shares, recipient },
    },
  };
}
