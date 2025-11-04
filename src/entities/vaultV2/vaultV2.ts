import { fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  depositVaultV2,
  getRequirements,
  type MorphoClient,
  redeemVaultV2,
  type Transaction,
  withdrawVaultV2,
} from "../../../src";

export interface VaultV2Actions {
  data: Awaited<ReturnType<typeof fetchVaultV2>>;
  deposit: (params: { assets: bigint }) => {
    tx: Readonly<Transaction>;
    getRequirements: () => Promise<Readonly<Transaction[]>>;
  };
  withdraw: (params: { assets: bigint }) => {
    tx: Readonly<Transaction>;
  };
  redeem: (params: { shares: bigint }) => {
    tx: Readonly<Transaction>;
  };
}

export async function instantiateVaultV2(
  client: MorphoClient,
  vault: Address,
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
    deposit: ({ assets }: { assets: bigint }) => {
      return {
        tx: depositVaultV2({
          chainId,
          asset: vaultData.asset,
          vault,
          assets: assets,
          shares: vaultData.toShares(assets),
          recipient: userAddress,
          metadata: client.metadata,
        }),
        getRequirements: async () =>
          getRequirements(client, {
            address: vaultData.asset,
            args: { amount: assets, from: userAddress },
          }),
      };
    },
    withdraw: ({ assets }: { assets: bigint }) => {
      return {
        tx: withdrawVaultV2({
          vault,
          assets,
          recipient: userAddress,
          onBehalf: userAddress,
          metadata: client.metadata,
        }),
      };
    },
    redeem: ({ shares }: { shares: bigint }) => {
      return {
        tx: redeemVaultV2({
          vault,
          shares,
          recipient: userAddress,
          onBehalf: userAddress,
          metadata: client.metadata,
        }),
      };
    },
  };
}
