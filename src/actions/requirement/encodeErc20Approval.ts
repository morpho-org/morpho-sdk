import { Address, MathLib } from "@morpho-org/blue-sdk";
import { MAX_TOKEN_APPROVALS } from "@morpho-org/simulation-sdk";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { Transaction } from "../../types/action";
import { deepFreeze } from "@morpho-org/morpho-ts";

interface EncodeErc20ApprovalParams {
  token: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
}

export const encodeErc20Approval = (
  params: EncodeErc20ApprovalParams
): Transaction => {
  deepFreeze(params);
  const { token, spender, amount, chainId } = params;

  let amountValue = amount;
  amountValue = MathLib.min(
    amountValue,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256
  );

  return deepFreeze({
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amountValue],
    }),
    value: 0n,
    action: {
      type: "erc20Approval",
      args: { spender: spender, amount: amountValue },
    },
  });
};
