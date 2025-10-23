import { Address, getChainAddresses } from "@morpho-org/blue-sdk";
import { fetchHolding } from "@morpho-org/blue-sdk-viem";
import { APPROVE_ONLY_ONCE_TOKENS } from "@morpho-org/simulation-sdk";
import { MorphoClient } from "src";

import { encodeErc20Approval } from "./encodeErc20Approval";

export const getRequirements = async (
  client: MorphoClient,
  {
    address,
    args: { amount, from },
  }: { address: Address; args: { amount: bigint; from: Address } }
) => {
  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    throw new Error("Chain ID not found in wallet client");
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const { erc20Allowances } = await fetchHolding(
    from,
    address,
    client.walletClient
  );

  const txs = [];

  if (erc20Allowances["bundler3.generalAdapter1"] < amount) {
    if (
      APPROVE_ONLY_ONCE_TOKENS[chainId]?.includes(address) &&
      erc20Allowances["bundler3.generalAdapter1"] > 0n
    ) {
      txs.push(...encodeErc20Approval(address, generalAdapter1, 0n, chainId));
    }

    txs.push(...encodeErc20Approval(address, generalAdapter1, amount, chainId));
  }

  return txs;
};
