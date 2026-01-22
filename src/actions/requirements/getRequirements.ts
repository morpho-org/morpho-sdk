import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { isDefined } from "@morpho-org/morpho-ts";
import type { Client } from "viem";
import {
  ChainIdMismatchError,
  type ERC20ApprovalAction,
  type Requirement,
  type Transaction,
} from "../../types";
import { getRequirementsApproval } from "./getRequirementsApproval";
import { getRequirementsPermit } from "./getRequirementsPermit";
import { getRequirementsPermit2 } from "./getRequirementsPermit2";

type GetRequirementsBaseParams = {
  address: Address;
  chainId: number;
  args: { amount: bigint; from: Address };
};

type GetRequirementsParams =
  | (GetRequirementsBaseParams & {
      /** Signature-based approvals are not supported. Classic approval (transaction) will be used. */
      supportSignature: false;
    })
  | (GetRequirementsBaseParams & {
      /** Signature-based approvals are supported. Will try permit (EIP-2612), else fallback to permit2. */
      supportSignature: true;
      /** Force use of permit2 even if simple permit (EIP-2612) is supported. Only applicable when `supportSignature` is `true`. */
      forcePermit2?: boolean;
    });

/**
 * Get token "requirement" for approval/permit before interacting with protocol.
 *
 * Three flows:
 * 1. If signature not supported, use classic approval (transaction).
 * 2. If signature supported, try simple permit (EIP-2612), else fallback to permit2.
 *
 * @param viemClient - The connected viem Client instance, with the correct chain and account.
 * @param params - Destructured object with:
 * @param params.address - ERC20 token address.
 * @param params.chainId - Chain/network id.
 * @param params.args - Object with:
 * @param params.args.amount - Required token amount.
 * @param params.args.from - The account that will grant approval.
 * @param params.supportSignature - Whether signature-based approvals are supported. If true, will try to use permit or permit2.
 * @param params.forcePermit2 - Whether to force use of permit2 even if permit is supported. Only available when `supportSignature` is `true`.
 * @returns Promise of array of approval transaction or requirement objects.
 */
export const getRequirements = async (
  viemClient: Client,
  params: GetRequirementsParams,
): Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]> => {
  const {
    address,
    chainId,
    supportSignature,
    args: { amount, from },
  } = params;
  if (viemClient.chain?.id !== chainId) {
    throw new ChainIdMismatchError(viemClient.chain?.id, chainId);
  }
  const {
    permit2,
    dai,
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);
  const { erc20Allowances, erc2612Nonce, permit2BundlerAllowance } =
    await fetchHolding(from, address, viemClient);

  if (supportSignature) {
    const { forcePermit2 } = params;
    const supportSimplePermit = isDefined(erc2612Nonce) && address !== dai;

    if (supportSimplePermit && !forcePermit2) {
      return await getRequirementsPermit(viemClient, {
        token: address,
        chainId,
        args: { amount },
        allowancesGeneralAdapter: erc20Allowances["bundler3.generalAdapter1"],
        nonce: erc2612Nonce,
      });
    }

    if (permit2) {
      return getRequirementsPermit2({
        address,
        chainId,
        permit2,
        args: { amount },
        allowancesGeneralAdapter: erc20Allowances["bundler3.generalAdapter1"],
        allowancesPermit2: erc20Allowances.permit2,
        allowanceGeneralAdapterPermit2: permit2BundlerAllowance.amount,
        allowanceGeneralAdapterExpiration: permit2BundlerAllowance.expiration,
        nonce: permit2BundlerAllowance.nonce,
      });
    }
  }

  return getRequirementsApproval({
    address,
    chainId,
    args: {
      spendAmount: amount,
      approvalAmount: amount,
      spender: generalAdapter1,
    },
    allowances: erc20Allowances["bundler3.generalAdapter1"],
  });
};
