import { type Address, getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import {
  Requirement,
  type ERC20ApprovalAction,
  type Transaction,
} from "../../types";
import { encodeErc20Approval } from "./encodeErc20Approval";

export const getPermits2 = (params: {
  address: Address;
  chainId: number;
  args: { amount: bigint };
  allowancesPermit2: bigint;
  allowanceBundlerPermit2: bigint;
  allowanceBundlerExpiration: bigint;
}): Readonly<Transaction<ERC20ApprovalAction> | Requirement>[] => {
  const {
    address,
    chainId,
    args: { amount },
    allowancesPermit2,
    allowanceBundlerPermit2,
    allowanceBundlerExpiration,
  } = params;

  const { permit2 } = getChainAddresses(chainId);

  const requirements: (Transaction<ERC20ApprovalAction> | Requirement)[] = [];

  if (allowancesPermit2 < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      allowancesPermit2 > 0n
    ) {
      requirements.push(
        encodeErc20Approval({
          token: address,
          spender: permit2,
          amount: 0n,
          chainId,
        })
      );
    }

    requirements.push(
      encodeErc20Approval({
        token: address,
        spender: permit2,
        amount: MathLib.MAX_UINT_160, // Always approve infinite.,
        chainId,
      })
    );
  }

  if (
    allowanceBundlerPermit2 < amount ||
    allowanceBundlerExpiration < BigInt(Math.floor(Date.now() / 1000)) // TODO: verify this
  ) {
    // operations.push({
    //   type: "Erc20_Permit2",
    //   sender: from,
    //   address,
    //   args: {
    //     amount,
    //     expiration: MathLib.MAX_UINT_48, // Always approve indefinitely.
    //     nonce: permit2BundlerAllowance.nonce,
    //   },
    // });
  }

  return requirements;
};
