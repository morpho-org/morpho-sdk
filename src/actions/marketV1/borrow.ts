import { blueAbi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { type Address, encodeFunctionData, type Hex } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type MarketParamsInput,
  type MarketV1BorrowAction,
  type Metadata,
  NonPositiveBorrowAmountError,
  type Transaction,
} from "../../types";

export interface MarketV1BorrowParams {
  market: {
    readonly morpho: Address;
    readonly marketId: Hex;
    readonly marketParams: MarketParamsInput;
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
 * The caller must have sufficient collateral to pass the on-chain health check.
 * Specifies exact asset amount; shares are computed by the protocol.
 *
 * @param params - Borrow parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1Borrow = ({
  market: { morpho, marketId, marketParams },
  args: { amount, onBehalf, receiver },
  metadata,
}: MarketV1BorrowParams): Readonly<Transaction<MarketV1BorrowAction>> => {
  if (amount <= 0n) {
    throw new NonPositiveBorrowAmountError(marketId);
  }

  let tx = {
    to: morpho,
    data: encodeFunctionData({
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
        market: marketId,
        amount,
        receiver,
      },
    },
  });
};
