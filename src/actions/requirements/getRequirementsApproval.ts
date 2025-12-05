import type { Address } from "@morpho-org/blue-sdk";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type { ERC20ApprovalAction, Transaction } from "../../types";
import { encodeErc20Approval } from "./encode/encodeErc20Approval";

/**
 * Get token "requirement" for approval.
 *
 * Verify if the allowance is enough on the spender contract.
 * => If not, approve the token to the spender contract with classic approval transaction on the required amount.
 * => If the allowance is enough, return an empty array.
 * 
 * Handle logic for reset approval before approving (if needed).
 *
 * @param params - Destructured object with:
 * @param params.address - ERC20 token address.
 * @param params.chainId - Chain/network id.
 * @param params.args - Object with:
 * @param params.args.amount - Required token amount.
 * @param params.args.spender - Spender contract address.
 * @param params.allowances - Allowance for the spender contract.
 * @returns An array of requirement transaction object.
 */
export const getRequirementsApproval = (params: {
  address: Address;
  chainId: number;
  args: { amount: bigint, spender: Address };
  allowances: bigint;
}): Readonly<Transaction<ERC20ApprovalAction>>[] => {
  const {
    address,
    chainId,
    args: { amount, spender },
    allowances,
  } = params;

  const approvals: Transaction<ERC20ApprovalAction>[] = [];

  if (allowances < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      allowances > 0n
    ) {
      approvals.push(
        encodeErc20Approval({
          token: address,
          spender,
          amount: 0n,
          chainId,
        }),
      );
    }

    approvals.push(
      encodeErc20Approval({
        token: address,
        spender,
        amount,
        chainId,
      }),
    );
  }

  return approvals;
};
