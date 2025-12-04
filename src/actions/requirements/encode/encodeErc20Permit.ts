import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import {
  fetchToken,
  getDaiPermitTypedData,
  getPermitTypedData,
} from "@morpho-org/blue-sdk-viem";
import { deepFreeze, Time } from "@morpho-org/morpho-ts";
import { type Client, type Hex, verifyTypedData } from "viem";
import {
  AddressMismatchError,
  MissingClientPropertyError,
  type Requirement,
} from "../../../types";

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

  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = now + Time.s.from.h(2n);

  return {
    action: {
      type: "permit",
      args: {
        spender,
        amount,
        deadline,
      },
    },
    async sign(client: Client, userAddress: Address) {
      if (!client.account) {
        throw new MissingClientPropertyError("client.account");
      }
      if (!client.account.signTypedData) {
        throw new MissingClientPropertyError("client.account.signTypedData");
      }
      if (client.account.address !== userAddress) {
        throw new AddressMismatchError(client.account.address, userAddress);
      }

      const { dai } = getChainAddresses(chainId);

      const isDai = dai != null && token === dai;

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

      return deepFreeze({
        owner: userAddress,
        signature,
        deadline,
        amount,
        asset: token,
        nonce,
      });
    },
  };
};
