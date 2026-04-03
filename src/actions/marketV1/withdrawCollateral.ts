import type { MarketParams } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type MarketV1WithdrawCollateralAction,
  type Metadata,
  NonPositiveWithdrawCollateralAmountError,
  type Transaction,
} from "../../types";

export interface MarketV1WithdrawCollateralParams {
  market: {
    readonly chainId: number;
    readonly marketParams: MarketParams;
  };
  args: {
    amount: bigint;
    receiver: Address;
  };
  metadata?: Metadata;
}

/**
 * Prepares a withdraw-collateral transaction for a Morpho Blue market.
 *
 * Routed through bundler3 via `morphoWithdrawCollateral`. The collateral is
 * sent directly from Morpho to the receiver.
 *
 * **Prerequisite:** GeneralAdapter1 must be authorized on Morpho to withdraw
 * collateral on behalf of the user.
 *
 * @param params - Withdraw collateral parameters.
 * @returns Deep-frozen transaction.
 */
export const marketV1WithdrawCollateral = ({
  market: { chainId, marketParams },
  args: { amount, receiver },
  metadata,
}: MarketV1WithdrawCollateralParams): Readonly<
  Transaction<MarketV1WithdrawCollateralAction>
> => {
  if (amount <= 0n) {
    throw new NonPositiveWithdrawCollateralAmountError(marketParams.id);
  }

  const actions: Action[] = [
    {
      type: "morphoWithdrawCollateral",
      args: [marketParams, amount, receiver, false],
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
      type: "marketV1WithdrawCollateral",
      args: {
        market: marketParams.id,
        amount,
        receiver,
      },
    },
  });
};
