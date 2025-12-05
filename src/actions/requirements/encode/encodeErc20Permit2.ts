import { type Address, getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import { getPermit2PermitTypedData } from "@morpho-org/blue-sdk-viem";
import { deepFreeze, Time } from "@morpho-org/morpho-ts";
import { type Account, type Chain, type Client, type Transport, verifyTypedData } from "viem";
import {
  AddressMismatchError,
  MissingClientPropertyError,
  type Requirement,
} from "../../../types";

interface EncodeErc20Permit2Params {
  token: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
  nonce: bigint;
  expiration: bigint;
}

export const encodeErc20Permit2 = (
  params: EncodeErc20Permit2Params,
): Requirement => {
  const {
    token,
    spender,
    amount,
    chainId,
    nonce,
    expiration = MathLib.MAX_UINT_48,
  } = params;

  const now = Time.timestamp();
  const deadline = now + Time.s.from.h(2n);

  return {
    action: {
      type: "permit2",
      args: {
        spender,
        amount,
        deadline,
        expiration,
      },
    },
    async sign(client: Client<Transport, Chain, Account>, userAddress: Address) {
      if (!client.account.signTypedData) {
        throw new MissingClientPropertyError("client.account.signTypedData");
      }
      if (client.account.address !== userAddress) {
        throw new AddressMismatchError(client.account.address, userAddress);
      }

      const {
        bundler3: { generalAdapter1 },
      } = getChainAddresses(chainId);

      const typedData = getPermit2PermitTypedData(
        {
          // Never permit any other address than the GeneralAdapter1 otherwise
          // the signature can be used independently.
          spender: generalAdapter1,
          allowance: amount,
          erc20: token,
          nonce: Number(nonce),
          deadline,
          expiration: Number(expiration),
        },
        chainId,
      );
      const signature = await client.account.signTypedData(typedData);

      await verifyTypedData({
        ...typedData,
        address: userAddress,
        signature,
      });

      return deepFreeze({
        owner: userAddress,
        signature,
        deadline,
        amount,
        asset: token,
        expiration,
        nonce,
      });
    },
  };
};
