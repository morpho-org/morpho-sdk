import type { MarketParams } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type MarketV1BorrowAction,
  type Metadata,
  NonPositiveBorrowAmountError,
  type Transaction,
} from "../../types";

export interface MarketV1BorrowParams {
  market: {
    readonly chainId: number;
    readonly marketParams: MarketParams;
  };
  args: {
    amount: bigint;
    receiver: Address;
    /** Minimum borrow share price (in ray). Protects against share price manipulation. */
    minSharePrice: bigint;
  };
  metadata?: Metadata;
}

/**
 * Prepares a borrow transaction for a Morpho Blue market.
 *
 * Routed through bundler3 via `morphoBorrow`. The bundler uses the transaction
 * initiator as `onBehalf`. Uses `minSharePrice` to protect against share price
 * manipulation between transaction construction and execution.
 *
 * @param params - Borrow parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1Borrow = ({
  market: { chainId, marketParams },
  args: { amount, receiver, minSharePrice },
  metadata,
}: MarketV1BorrowParams): Readonly<Transaction<MarketV1BorrowAction>> => {
  if (amount <= 0n) {
    throw new NonPositiveBorrowAmountError(marketParams.id);
  }

  const actions: Action[] = [
    {
      type: "morphoBorrow",
      args: [marketParams, amount, 0n, minSharePrice, receiver, false],
    },
  ];

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
      type: "marketV1Borrow",
      args: {
        market: marketParams.id,
        amount,
        receiver,
        minSharePrice,
      },
    },
  });
};
