import { type Address, MathLib } from "@morpho-org/blue-sdk";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type {
  ERC20ApprovalAction,
  Requirement,
  Transaction,
} from "../../types";
import { encodeErc20Approval } from "./encode/encodeErc20Approval";
import { encodeErc20Permit2 } from "./encode/encodeErc20Permit2";

export const getPermits2 = (params: {
  address: Address;
  chainId: number;
  permit2: Address;
  args: { amount: bigint };
  allowancesPermit2: bigint;
  allowanceBundlerPermit2: bigint;
  allowanceBundlerExpiration: bigint;
  nonce: bigint;
}): Readonly<Transaction<ERC20ApprovalAction> | Requirement>[] => {
  const {
    address,
    chainId,
    permit2,
    args: { amount },
    allowancesPermit2,
    allowanceBundlerPermit2,
    allowanceBundlerExpiration,
    nonce,
  } = params;

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
        }),
      );
    }

    requirements.push(
      encodeErc20Approval({
        token: address,
        spender: permit2,
        amount: MathLib.MAX_UINT_160, // Always approve infinite.
        chainId,
      }),
    );
  }

  if (
    allowanceBundlerPermit2 < amount ||
    allowanceBundlerExpiration < BigInt(Math.floor(Date.now() / 1000)) // TODO: verify this
  ) {
    requirements.push(
      encodeErc20Permit2({
        token: address,
        spender: permit2,
        amount,
        chainId,
        nonce,
        expiration: MathLib.MAX_UINT_48, // Always approve indefinitely.
      }),
    );
  }

  return requirements;
};
