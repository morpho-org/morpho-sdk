import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Address, type Client } from "viem";
import { encodeErc20Permit } from "./encode";

/**
 * Get token "requirement" for permit (EIP-2612).
 *
 * Verify if the allowance is enough on general adapter from permit (EIP-2612) contract.
 * => If not, approve the token to general adapter from permit via EIP-2612 with permit signature on the required amount.
 *
 * @param viemClient - The viem Client instance
 * @param params - Destructured object with:
 * @param params.token - ERC20 token.
 * @param params.chainId - Chain/network id.
 * @param params.args - Object with:
 * @param params.args.amount - Required token amount.
 * @param params.allowancesGeneralAdapter - Allowance for general adapter from permit contract.
 * @param params.nonce - Nonce for permit (EIP-2612).
 * @returns An array of requirement signature object.
 */
export const getRequirementsPermit = async (
  viemClient: Client,
  params: {
    token: Address;
    chainId: number;
    args: { amount: bigint };
    allowancesGeneralAdapter: bigint;
    nonce: bigint;
  },
) => {
  const {
    token,
    chainId,
    args: { amount },
    allowancesGeneralAdapter,
    nonce,
  } = params;

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  if (allowancesGeneralAdapter < amount) {
    return [
      await encodeErc20Permit(viemClient, {
        token,
        spender: generalAdapter1,
        amount,
        chainId,
        nonce,
      }),
    ];
  }

  return [];
};
