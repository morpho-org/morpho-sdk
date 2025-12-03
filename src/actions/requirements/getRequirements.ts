import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import type { Client } from "viem";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  type Requirement,
  type Transaction,
} from "../../types";
import { encodeErc20Permit } from "./encodeErc20Permit";
import { isDefined } from "@morpho-org/morpho-ts";
import { getApprovals } from "./getApprovals";
import { getPermits2 } from "./getPermits2";

// not support signature => classic approval

// support signature => permit or permit2
/// if support simple permit => permit
/// else => permit2

export const getRequirements = async (
  viemClient: Client,
  params: {
    address: Address;
    chainId: number;
    args: { amount: bigint; from: Address };
  },
  supportSignature: boolean
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

  const { erc20Allowances, erc2612Nonce, permit2BundlerAllowance } =
    await fetchHolding(from, address, viemClient);

  if (supportSignature) {
    const supportSimplePermit = isDefined(erc2612Nonce);

    if (supportSimplePermit) {
      return [
        encodeErc20Permit({
          token: address,
          spender: generalAdapter1,
          amount,
          chainId,
          nonce: erc2612Nonce,
        }),
      ];
    }

    return getPermits2({
      address,
      chainId,
      args: { amount },
      allowancesPermit2: erc20Allowances.permit2,
      allowanceBundlerPermit2: permit2BundlerAllowance.amount,
      allowanceBundlerExpiration: permit2BundlerAllowance.expiration,
    });
  }

  return getApprovals({
    address,
    chainId,
    args: { amount },
    allowancesGeneralAdapter: erc20Allowances["bundler3.generalAdapter1"],
  });
};
