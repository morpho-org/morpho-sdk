import { type Address, MathLib } from "@morpho-org/blue-sdk";
import { MAX_TOKEN_APPROVALS } from "@morpho-org/simulation-sdk";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import type { ERC20ApprovalAction, Transaction } from "../../types";

interface EncodeErc20ApprovalParams {
  token: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
}


export const encodeErc20Approval = (
  { token, spender, amount, chainId }: EncodeErc20ApprovalParams, // destructuring here makes more sense
): Transaction<ERC20ApprovalAction> => {
  // freezing is useless as you destruct the object


  amount = MathLib.min(
    amount,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256,
  );

  // I'm not sure we want to freeze the object here
  // In case we do, we should use `deepFreeze` from `@morpho-org/utils`
  return Object.freeze({
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
    value: 0n,
    action: {
      type: "erc20Approval" as const,
      args: { spender: spender, amount: amount },
    },
  });
};
