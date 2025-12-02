import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import {
  fetchToken,
  getDaiPermitTypedData,
  getPermitTypedData,
} from "@morpho-org/blue-sdk-viem";
import { deepFreeze, Time } from "@morpho-org/morpho-ts";
import { type Client, type Hex, verifyTypedData } from "viem";
import type { Requirement } from "../../types";

interface EncodeErc20PermitParams {
  token: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
  nonce: bigint;
}

export const encodeErc20Permit = (
  params: EncodeErc20PermitParams,
): Requirement => {
  const { token, spender, amount, chainId, nonce } = params;

  const { dai } = getChainAddresses(chainId);

  // TODO: verify it
  //   const amountValue = MathLib.min(
  //     amount,
  //     MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256,
  //   );

  const isDai = dai != null && token === dai;

  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = now + Time.s.from.h(2n);

  return {
    action: {
      type: "signature",
      args: {
        spender,
        amount,
      },
    },
    async sign(client: Client, userAddress: Address) {
      // verify userAddress everywhere

      if (!client.account || !client.account.signTypedData) {
        throw new Error("Client missing account or signTypedData method"); // TODO: generic error
      }
      if (client.account.address !== userAddress) {
        throw new Error("Client account address does not match user address"); // TODO: generic error
      }

      let signature: Hex;
      if (isDai) {
        const typedData = getDaiPermitTypedData(
          {
            owner: userAddress,
            spender,
            allowance: amount,
            nonce,
            deadline,
          },
          chainId,
        );
        signature = await client.account.signTypedData(typedData);

        await verifyTypedData({
          ...typedData,
          address: userAddress,
          signature,
        });
      } else {
        const tokenData = await fetchToken(token, client);
        const typedData = getPermitTypedData(
          {
            erc20: tokenData,
            owner: userAddress,
            spender,
            allowance: amount,
            nonce,
            deadline,
          },
          chainId,
        );
        signature = await client.account.signTypedData(typedData);

        await verifyTypedData({
          ...typedData,
          address: userAddress, // Verify against the permit's owner.
          signature,
        });
      }

      return deepFreeze(signature);
    },
  };
};
