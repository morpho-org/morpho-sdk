import { Address, MathLib } from "@morpho-org/blue-sdk";
import { TransactionRequirement } from "@morpho-org/bundler-sdk-viem";
import { MAX_TOKEN_APPROVALS } from "@morpho-org/simulation-sdk";
import { encodeFunctionData, erc20Abi, maxUint256 } from "viem";

export const encodeErc20Approval = (
  token: Address,
  spender: Address,
  amount: bigint,
  chainId: number
) => {
  amount = MathLib.min(
    amount,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256
  );

  return {
    to: token,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [spender, amount],
    }),
    value: 0n,
  };
};
