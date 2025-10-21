import { depositVaultV2, MorphoClient, VaultParams, VaultV2Actions } from "src";
import { Address } from "viem";

export function createVaultV2(
  client: MorphoClient,
  { vault, asset }: VaultParams
): VaultV2Actions {
  const userAddress = client.walletClient.account?.address;
  if (!userAddress) {
    throw new Error("User address not found");
  }
  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    throw new Error("Chain ID not found");
  }

  return {
    deposit: ({
      amount,
      recipient = userAddress,
    }: {
      amount: bigint;
      recipient?: Address;
    }) => depositVaultV2({ chainId, asset, vault, amount, recipient }),
  };
}
