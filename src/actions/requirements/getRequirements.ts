import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type {
  ERC20ApprovalAction,
  MorphoClient,
  Transaction,
} from "../../types";

import { encodeErc20Approval } from "./encodeErc20Approval";

// NB requirements are not necessarily approvals
export const getRequirements = async (
  client: MorphoClient,
  params: { address: Address; args: { amount: bigint; from: Address } }, // use explicit interface
): Promise<Readonly<Transaction<ERC20ApprovalAction>[]>> => {
  // again don't freeze + destructure in function parameters
  Object.freeze(params);
  const {
    address,
    args: { amount, from },
  } = params;

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(client.chainId);

  const { erc20Allowances } = await fetchHolding(
    from,
    address,
    client.viemClient,
  );

  const txs: Transaction<ERC20ApprovalAction>[] = [];

  if (erc20Allowances["bundler3.generalAdapter1"] < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[client.chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    ) {
      txs.push(
        encodeErc20Approval({
          token: address,
          spender: generalAdapter1,
          amount: 0n,
          chainId: client.chainId,
        }),
      );
    }

    txs.push(
      encodeErc20Approval({
        token: address,
        spender: generalAdapter1,
        amount,
        chainId: client.chainId,
      }),
    );
  }

  return Object.freeze(txs);
  // As discussed, we should return the object directly instead of freezing it and let the consumer freeze it if they want
  // We sould use deepFreeze if we really want to freeze
};
