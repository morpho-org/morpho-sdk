import { Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
} from "@morpho-org/blue-sdk";
import { Address } from "viem";

export function deposit({
  chainId,
  asset,
  vault,
  amount,
  recipient,
}: {
  chainId: number;
  asset: Address;
  vault: Address;
  amount: bigint;
  recipient: Address;
}) {
  const amountInShares = 1n; // TODO: get
  const maxSharePrice = MathLib.mulDivUp(
    amount,
    MathLib.wToRay(MathLib.WAD + DEFAULT_SLIPPAGE_TOLERANCE),
    amountInShares
  );

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const actions: Action[] = [
    {
      type: "erc20TransferFrom",
      args: [asset, amount, generalAdapter1, false],
    },
    {
      type: "erc4626Deposit",
      args: [vault, amount, maxSharePrice, recipient, false],
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

  return BundlerAction.encodeBundle(chainId, actions);
}
