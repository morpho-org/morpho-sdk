import {
  depositVaultV2,
  getRequirements,
  MorphoClient,
  redeemVaultV2,
  Transaction,
  withdrawVaultV2,
} from "src";
import { Address } from "viem";
import { fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import { TransactionRequirement } from "@morpho-org/bundler-sdk-viem";

export interface VaultV2Actions {
  data: Awaited<ReturnType<typeof fetchVaultV2>>;
  deposit: (params: { assets: bigint }) => {
    tx: Transaction;
    getRequirements: () => Promise<TransactionRequirement[]>;
  };
  withdraw: (params: { assets: bigint }) => {
    tx: Transaction;
  };
  redeem: (params: { shares: bigint }) => {
    tx: Transaction;
  };
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
    deposit: ({ assets }: { assets: bigint }) => {
      const tx = depositVaultV2({
        chainId,
        asset: vaultData.asset,
        vault,
        assets: assets,
        shares: vaultData.toShares(assets),
        recipient: userAddress,
      });

      return {
        tx,
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
        }),
      };
    },
  };
}
