import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type { Client } from "viem";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  type Transaction,
} from "../../types";
import { encodeErc20Approval } from "./encodeErc20Approval";

export const getRequirements = async (
  viemClient: Client,
  params: {
    address: Address;
    chainId: number;
    args: { amount: bigint; from: Address };
  },
): Promise<Readonly<Transaction<ERC20ApprovalAction>[]>> => {
  const {
    address,
    chainId,
    args: { amount, from },
  } = params;
  if (viemClient.chain?.id !== chainId) {
    throw new ChainIdMismatchError(viemClient.chain?.id, chainId);
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const { erc20Allowances } = await fetchHolding(from, address, viemClient);

  const txs: Transaction<ERC20ApprovalAction>[] = [];

  if (erc20Allowances["bundler3.generalAdapter1"] < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    ) {
      txs.push(
        encodeErc20Approval({
          token: address,
          spender: generalAdapter1,
          amount: 0n,
          chainId,
        }),
      );
    }

    txs.push(
      encodeErc20Approval({
        token: address,
        spender: generalAdapter1,
        amount,
        chainId,
      }),
    );
  }

  return deepFreeze(txs);
};
