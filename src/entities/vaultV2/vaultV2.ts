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
  getData: () => Promise<Awaited<ReturnType<typeof fetchVaultV2>>>;
  prepareDeposit: (params: { assets: bigint }) => Promise<{
    tx: Readonly<Transaction>;
    getRequirements: () => Promise<Readonly<Transaction[]>>;
  }>;
  withdraw: (params: { assets: bigint }) => {
    tx: Readonly<Transaction>;
  };
  redeem: (params: { shares: bigint }) => {
    tx: Readonly<Transaction>;
  };
}

export function instantiateVaultV2(
  client: MorphoClient,
  vault: Address,
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
    getData: async () => fetchVaultV2(vault, client.walletClient),
    prepareDeposit: async ({ assets }: { assets: bigint }) => {
      const vaultData = await fetchVaultV2(vault, client.walletClient);
      const shares = vaultData.toShares(assets);
      return {
        tx: depositVaultV2({
          chainId,
          asset: vaultData.asset,
          vault,
          assets,
          shares,
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
