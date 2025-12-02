import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import type { Client } from "viem";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  type Requirement,
  type Transaction,
} from "../../types";
import { encodeErc20Approval } from "./encodeErc20Approval";
import { encodeErc20Permit } from "./encodeErc20Permit";

export const getRequirements = async (
  viemClient: Client,
  params: {
    address: Address;
    chainId: number;
    args: { amount: bigint; from: Address };
  },
  supportSignature: boolean,
): Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]> => {
  const {
    address,
    chainId,
    args: { amount, from },
  } = params;
  if (viemClient.chain?.id !== chainId) {
    throw new ChainIdMismatchError(viemClient.chain?.id, chainId);
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const { erc20Allowances, erc2612Nonce } = await fetchHolding(
    from,
    address,
    viemClient,
  );

  const requirements: (Transaction<ERC20ApprovalAction> | Requirement)[] = [];

  if (erc20Allowances["bundler3.generalAdapter1"] < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    ) {
      if (supportSignature) {
        requirements.push(
          encodeErc20Permit({
            token: address,
            spender: generalAdapter1,
            amount: 0n,
            chainId,
            nonce: erc2612Nonce, // TODO: handle undefined
          }),
        );
      } else {
        requirements.push(
          encodeErc20Approval({
            token: address,
            spender: generalAdapter1,
            amount: 0n,
            chainId,
          }),
        );
      }
    }

    if (supportSignature) {
      requirements.push(
        encodeErc20Permit({
          token: address,
          spender: generalAdapter1,
          amount,
          chainId,
          nonce: erc2612Nonce, // TODO: handle undefined
        }),
      );
    } else {
      requirements.push(
        encodeErc20Approval({
          token: address,
          spender: generalAdapter1,
          amount,
          chainId,
        }),
      );
    }
  }

  return requirements;
};
