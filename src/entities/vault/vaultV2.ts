import { depositVaultV2, MorphoClient, Transaction } from "src";
import { Address } from "viem";
import { fetchVaultV2 } from "@morpho-org/blue-sdk-viem";

export interface VaultV2Actions {
  data: Awaited<ReturnType<typeof fetchVaultV2>>;
  deposit: (params: { assets: bigint }) => Transaction;
}

export async function instantiateVaultV2(
  client: MorphoClient,
  vault: Address
): Promise<VaultV2Actions> {
  const userAddress = client.walletClient.account?.address;
  if (!userAddress) {
    throw new Error("User address not found");
  }
  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    throw new Error("Chain ID not found");
  }

  const vaultData = await fetchVaultV2(vault, client.walletClient);

  return {
    data: vaultData,
    deposit: ({ assets }: { assets: bigint }) =>
      depositVaultV2({
        chainId,
        asset: vaultData.asset,
        vault,
        assets: assets,
        shares: vaultData.toShares(assets),
        recipient: userAddress,
      }),
  };
}
