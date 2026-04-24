import { getChainAddresses } from "@morpho-org/blue-sdk";
import type { Action } from "@morpho-org/bundler-sdk-viem";
import { type Address, isAddressEqual } from "viem";
import {
  DepositAmountMismatchError,
  DepositAssetMismatchError,
  type Permit2Action,
  type PermitAction,
  type PermitArgs,
} from "../../types";

interface GetRequirementsActionParams {
  chainId: number;
  asset: Address;
  amount: bigint;
  requirementSignature: {
    args: PermitArgs;
    action: PermitAction | Permit2Action;
  };
  /**
   * When true, the permit / approve2 leg is encoded with `skipRevert = true`
   * so a pre-consumed nonce does not brick the whole bundle. The subsequent
   * `erc20TransferFrom` / `transferFrom2` leg keeps `skipRevert = false`, so
   * the bundle still fails closed if no sufficient allowance is installed.
   *
   * Intended for flows where a signed requirement signature is visible in the
   * mempool and an attacker could cheaply front-run the permit call to grief
   * the user (e.g. time-sensitive repayment bundles).
   *
   * @default false
   */
  skipRevertOnPermit?: boolean;
}

/**
 * Get the actions required to transfer the asset based on the requirement signature.
 */
export const getRequirementsAction = ({
  chainId,
  asset,
  amount,
  requirementSignature,
  skipRevertOnPermit = false,
}: GetRequirementsActionParams): Action[] => {
  if (!isAddressEqual(requirementSignature.args.asset, asset)) {
    throw new DepositAssetMismatchError(asset, requirementSignature.args.asset);
  }

  if (requirementSignature.args.amount !== amount) {
    throw new DepositAmountMismatchError(
      amount,
      requirementSignature.args.amount,
    );
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  if (requirementSignature.action.type === "permit2") {
    if (!("expiration" in requirementSignature.args)) {
      throw new Error("Expiration is not defined");
    }
    return [
      {
        type: "approve2",
        args: [
          requirementSignature.args.owner,
          {
            details: {
              token: requirementSignature.args.asset,
              amount: requirementSignature.args.amount,
              nonce: Number(requirementSignature.args.nonce),
              expiration: Number(requirementSignature.args.expiration),
            },
            sigDeadline: requirementSignature.args.deadline,
          },
          requirementSignature.args.signature,
          skipRevertOnPermit,
        ],
      },
      {
        type: "transferFrom2",
        args: [asset, amount, generalAdapter1, false /* skipRevert */],
      },
    ];
  }

  return [
    {
      type: "permit",
      args: [
        requirementSignature.args.owner,
        requirementSignature.args.asset,
        requirementSignature.args.amount,
        requirementSignature.args.deadline,
        requirementSignature.args.signature,
        skipRevertOnPermit,
      ],
    },
    {
      type: "erc20TransferFrom",
      args: [asset, amount, generalAdapter1, false /* skipRevert */],
    },
  ];
};
