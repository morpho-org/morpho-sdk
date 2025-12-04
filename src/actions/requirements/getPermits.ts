import { type Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { encodeErc20Permit } from "./encode";

export const getPermits = (params: {
  address: Address;
  chainId: number;
  args: { amount: bigint };
  allowancesGeneralAdapter: bigint;
  nonce: bigint;
}) => {
  const {
    address,
    chainId,
    args: { amount },
    allowancesGeneralAdapter,
    nonce,
  } = params;

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  if (allowancesGeneralAdapter < amount) {
    return [
      encodeErc20Permit({
        token: address,
        spender: generalAdapter1,
        amount,
        chainId,
        nonce,
      }),
    ];
  }

  return [];
};
