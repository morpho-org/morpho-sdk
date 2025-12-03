import { type Address, getChainAddresses, MathLib } from "@morpho-org/blue-sdk";
import {
  fetchToken,
  getPermit2PermitTypedData,
  getPermitTypedData,
} from "@morpho-org/blue-sdk-viem";
import { deepFreeze, Time } from "@morpho-org/morpho-ts";
import { type Client, type Hex, verifyTypedData, maxUint256 } from "viem";
import {
  AddressMismatchError,
  MissingClientPropertyError,
  type Requirement,
} from "../../types";
import { MAX_TOKEN_APPROVALS } from "@morpho-org/simulation-sdk";

interface EncodeErc20Permit2Params {
  token: Address;
  spender: Address;
  amount: bigint;
  chainId: number;
  nonce: bigint;
  expiration: bigint;
}

export const encodeErc20Permit2 = (
  params: EncodeErc20Permit2Params
): Requirement => {
  const { token, spender, amount, chainId, nonce, expiration = MathLib.MAX_UINT_48 } = params;

  const amountValue = MathLib.min(
    amount,
    MAX_TOKEN_APPROVALS[chainId]?.[token] ?? maxUint256
  );

  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadline = now + Time.s.from.h(2n);

  return {
    action: {
      type: "permit2",
      args: {
        spender,
        amount: amountValue,
        deadline,
        expiration,
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

      const { generalAdapter1 } = getChainAddresses(chainId);

      let signature: Hex;

      const typedData = getPermit2PermitTypedData(
        {
          // Never permit any other address than the GeneralAdapter1 otherwise
          // the signature can be used independently.
          spender: generalAdapter1,
          allowance: amountValue,
          erc20: token,
          nonce: Number(nonce),
          deadline,
          expiration: Number(expiration),
        },
        chainId
      );
      signature = await client.account.signTypedData(typedData);

      await verifyTypedData({
        ...typedData,
        address: userAddress,
        signature,
      });

      return deepFreeze({
        owner: userAddress,
        signature,
        deadline,
        amount: amountValue,
        asset: token,
        nonce,
      });
    },
  };
};
