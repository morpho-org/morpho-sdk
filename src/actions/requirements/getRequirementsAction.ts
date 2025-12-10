import { getChainAddresses } from "@morpho-org/blue-sdk";
import type { Action } from "@morpho-org/bundler-sdk-viem";
import type { Permit2Action, PermitAction, PermitArgs } from "../../types";

interface GetRequirementsActionParams {
  chainId: number;
  requirementSignature: {
    args: PermitArgs;
    action: PermitAction | Permit2Action;
  };
}

/**
 * Get the actions required to transfer the asset based on the requirement signature.
 */
export const getRequirementsAction = ({
  chainId,
  requirementSignature,
}: GetRequirementsActionParams): Action[] => {
  const {
    dai,
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
          false,
        ],
      },
      {
        type: "transferFrom2",
        args: [
          requirementSignature.args.asset,
          requirementSignature.args.amount,
          generalAdapter1,
          false,
        ],
      },
    ];
  }

  const isDai = dai != null && requirementSignature.args.asset === dai;

  if (isDai) {
    return [
      {
        type: "permitDai",
        args: [
          requirementSignature.args.owner,
          requirementSignature.args.nonce,
          requirementSignature.args.deadline,
          requirementSignature.args.amount > 0n,
          requirementSignature.args.signature,
          false,
        ],
      },
      {
        type: "erc20TransferFrom",
        args: [
          requirementSignature.args.asset,
          requirementSignature.args.amount,
          generalAdapter1,
          false,
        ],
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
        false,
      ],
    },
    {
      type: "erc20TransferFrom",
      args: [
        requirementSignature.args.asset,
        requirementSignature.args.amount,
        generalAdapter1,
        false,
      ],
    },
  ];
};
