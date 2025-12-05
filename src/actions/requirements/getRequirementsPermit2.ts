import { type Address, MathLib } from "@morpho-org/blue-sdk";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type {
  ERC20ApprovalAction,
  Requirement,
  Transaction,
} from "../../types";
import { encodeErc20Approval } from "./encode/encodeErc20Approval";
import { encodeErc20Permit2 } from "./encode/encodeErc20Permit2";

/**
 * Get token "requirement" for permit2.
 *
 * Two steps:
 * 1. Verify if the allowance is enough on permit2 contract.
 * => If not, approve the token to permit2 contract with classic approval on infinite amount.
 * 2. Verify if the allowance is enough on general adapter from permit2 contract.
 * => If not, approve the token to general adapter from permit2 contract with permit2 signature on the required amount.
 *
 * @param params - Destructured object with:
 * @param params.address - ERC20 token address.
 * @param params.chainId - Chain/network id.
 * @param params.permit2 - Permit2 contract address.
 * @param params.args - Object with:
 * @param params.args.amount - Required token amount.
 * @param params.allowancesPermit2 - Allowance for permit2.
 * @param params.allowanceGeneralAdapterPermit2 - Allowance for general adapter from permit2 contract.
 * @param params.allowanceGeneralAdapterExpiration - Expiration for general adapter from permit2 contract.
 * @param params.nonce - Nonce for permit2.
 * @returns An array of approval transaction or requirement signatures objects.
 */
export const getRequirementsPermit2 = (params: {
  address: Address;
  chainId: number;
  permit2: Address;
  args: { amount: bigint };
  allowancesPermit2: bigint;
  allowanceGeneralAdapterPermit2: bigint;
  allowanceGeneralAdapterExpiration: bigint;
  nonce: bigint;
}): Readonly<Transaction<ERC20ApprovalAction> | Requirement>[] => {
  const {
    address,
    chainId,
    permit2,
    args: { amount },
    allowancesPermit2,
    allowanceGeneralAdapterPermit2,
    allowanceGeneralAdapterExpiration,
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
    allowanceGeneralAdapterPermit2 < amount ||
    allowanceGeneralAdapterExpiration < BigInt(Math.floor(Date.now() / 1000)) // TODO: verify this
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
