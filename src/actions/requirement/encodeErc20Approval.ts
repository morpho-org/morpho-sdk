import { Address, MathLib } from "@morpho-org/blue-sdk";
import { MAX_TOKEN_APPROVALS } from "@morpho-org/simulation-sdk";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";
import { Transaction } from "../../types/action";
import { deepFreeze } from "@morpho-org/morpho-ts";

export const encodeErc20Approval = (
  token: Address,
  spender: Address,
  amount: bigint,
  chainId: number
): Transaction => {
  amount = MathLib.min(
    amount,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256
  );

  return deepFreeze({
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
    value: 0n,
    action: {
      type: "erc20Approval",
      args: { spender, amount },
    },
  });
};
