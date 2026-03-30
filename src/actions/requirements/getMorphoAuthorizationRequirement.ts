import { getChainAddresses } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Client } from "viem";
import { type Address, encodeFunctionData, publicActions } from "viem";
import type { MorphoAuthorizationAction, Transaction } from "../../types";

/**
 * Checks whether GeneralAdapter1 is authorized on Morpho for the given user.
 * If not authorized, returns a deep-frozen `morpho.setAuthorization(generalAdapter1, true)` transaction.
 * Returns `null` if authorization is already in place.
 *
 * Required before any bundled borrow on behalf of the user (e.g. `supplyCollateralBorrow`).
 *
 * @param viemClient - Connected viem client.
 * @param chainId - Target chain ID (used to look up Morpho and GeneralAdapter1 addresses).
 * @param userAddress - The user who needs to authorize GeneralAdapter1.
 * @returns Deep-frozen authorization transaction, or `null` if already authorized.
 */
export const getMorphoAuthorizationRequirement = async (
  viemClient: Client,
  chainId: number,
  userAddress: Address,
): Promise<Readonly<Transaction<MorphoAuthorizationAction>> | null> => {
  const {
    morpho,
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const pc = viemClient.extend(publicActions);
  const isAuthorized = await pc.readContract({
    address: morpho,
    abi: blueAbi,
    functionName: "isAuthorized",
    args: [userAddress, generalAdapter1],
  });

  if (isAuthorized) {
    return null;
  }

  return deepFreeze({
    to: morpho,
    data: encodeFunctionData({
      abi: blueAbi,
      functionName: "setAuthorization",
      args: [generalAdapter1, true],
    }),
    value: 0n,
    action: {
      type: "morphoAuthorization",
      args: {
        authorized: generalAdapter1,
        isAuthorized: true,
      },
    },
  });
};
