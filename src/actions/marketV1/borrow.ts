import { getChainAddresses, type MarketParams } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData } from "viem";
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
    onBehalf: Address;
    receiver: Address;
  };
  metadata?: Metadata;
}

/**
 * Prepares a borrow transaction for a Morpho Blue market.
 *
 * Direct call to `morpho.borrow()`. No bundler needed.
 * Specifies exact asset amount; shares are computed by the protocol.
 *
 * @param params - Borrow parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1Borrow = ({
  market: { chainId, marketParams },
  args: { amount, onBehalf, receiver },
  metadata,
}: MarketV1BorrowParams): Readonly<Transaction<MarketV1BorrowAction>> => {
  if (amount <= 0n) {
    throw new NonPositiveBorrowAmountError(marketParams.id);
  }

  const { morpho } = getChainAddresses(chainId);

  let tx = {
    to: morpho,
    data: encodeFunctionData({
      // TODO: Verify if we need to pass min-share-price
      abi: blueAbi,
      functionName: "borrow",
      args: [marketParams, amount, 0n, onBehalf, receiver],
    }),
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
      },
    },
  });
};
