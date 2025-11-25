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
  params: EncodeErc20ApprovalParams,
): Transaction<ERC20ApprovalAction> => {
  Object.freeze(params); // This is an undesired side effect
  const { token, spender, amount, chainId } = params; // You shouldn't freeze and destructure in function parameters

  // use a const here and do all in one line
  let amountValue = amount;
  amountValue = MathLib.min(
    amountValue,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256,
  );

  // As discussed, we should return the object directly instead of freezing it and let the consumer freeze it if they want
  // We sould use deepFreeze if we really want to freeze
  return Object.freeze({
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amountValue],
    }),
    value: 0n,
    action: {
      type: "erc20Approval" as const,
      args: { spender: spender, amount: amountValue },
    },
  });
};
