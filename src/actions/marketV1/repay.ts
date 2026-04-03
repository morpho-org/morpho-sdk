import { getChainAddresses, type MarketParams } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type MarketV1RepayAction,
  type Metadata,
  NonPositiveRepayAmountError,
  type RequirementSignature,
  type Transaction,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

export interface MarketV1RepayParams {
  market: {
    readonly chainId: number;
    readonly marketParams: MarketParams;
  };
  args: {
    /** Repay assets amount (0n when repaying by shares). */
    assets: bigint;
    /** Repay shares amount (0n when repaying by assets). */
    shares: bigint;
    /** ERC20 amount to transfer to GeneralAdapter1 (computed by entity). */
    transferAmount: bigint;
    onBehalf: Address;
    /** Maximum repay share price (in ray). Protects against share price manipulation. */
    maxSharePrice: bigint;
    requirementSignature?: RequirementSignature;
  };
  metadata?: Metadata;
}

/**
 * Prepares a repay transaction for a Morpho Blue market.
 *
 * Routed through bundler3 via GeneralAdapter1. Supports two modes:
 * - **By assets** (`assets > 0, shares = 0`): repays an exact asset amount.
 * - **By shares** (`assets = 0, shares > 0`): repays exact shares (full repay).
 *
 * Exactly one of `assets`/`shares` must be non-zero. The `transferAmount` controls
 * how many ERC20 tokens are pulled from the user (may differ from `assets` in
 * shares mode where the entity computes an upper-bound estimate).
 *
 * Uses `maxSharePrice` to protect against share price manipulation between
 * transaction construction and execution.
 *
 * @param params - Repay parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1Repay = ({
  market: { chainId, marketParams },
  args: {
    assets,
    shares,
    transferAmount,
    onBehalf,
    maxSharePrice,
    requirementSignature,
  },
  metadata,
}: MarketV1RepayParams): Readonly<Transaction<MarketV1RepayAction>> => {
  if (assets > 0n && shares > 0n) {
    throw new NonPositiveRepayAmountError(marketParams.id);
  }

  if (assets === 0n && shares === 0n) {
    throw new NonPositiveRepayAmountError(marketParams.id);
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const actions: Action[] = [];

  if (transferAmount > 0n) {
    if (requirementSignature) {
      actions.push(
        ...getRequirementsAction({
          chainId,
          asset: marketParams.loanToken,
          amount: transferAmount,
          requirementSignature,
        }),
      );
    } else {
      actions.push({
        type: "erc20TransferFrom",
        args: [marketParams.loanToken, transferAmount, generalAdapter1, false],
      });
    }
  }

  actions.push({
    type: "morphoRepay",
    args: [marketParams, assets, shares, maxSharePrice, onBehalf, [], false],
  });

  let tx = {
    ...BundlerAction.encodeBundle(chainId, actions),
    value: 0n,
  };

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "marketV1Repay",
      args: {
        market: marketParams.id,
        assets,
        shares,
        onBehalf,
        maxSharePrice,
      },
    },
  });
};
