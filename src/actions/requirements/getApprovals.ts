import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import { type ERC20ApprovalAction, type Transaction } from "../../types";
import { encodeErc20Approval } from "./encode/encodeErc20Approval";

export const getApprovals = (params: {
  address: Address;
  chainId: number;
  args: { amount: bigint };
  allowancesGeneralAdapter: bigint;
}): Readonly<Transaction<ERC20ApprovalAction>>[] => {
  const {
    address,
    chainId,
    args: { amount },
    allowancesGeneralAdapter,
  } = params;

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const approvals: Transaction<ERC20ApprovalAction>[] = [];

  if (allowancesGeneralAdapter < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      allowancesGeneralAdapter > 0n
    ) {
      approvals.push(
        encodeErc20Approval({
          token: address,
          spender: generalAdapter1,
          amount: 0n,
          chainId,
        })
      );
    }

    approvals.push(
      encodeErc20Approval({
        token: address,
        spender: generalAdapter1,
        amount,
        chainId,
      })
    );
  }

  return approvals;
};
