import { fetchVaultV2 } from "@morpho-org/blue-sdk-viem";
import type { Address } from "viem";
import {
  depositVaultV2,
  getRequirements,
  redeemVaultV2,
  withdrawVaultV2,
} from "../../actions";
import { withTelemetry } from "../../telemetry/wrapper";
import type {
  ERC20ApprovalAction,
  MorphoClient,
  Transaction,
  VaultV2DepositAction,
  VaultV2RedeemAction,
  VaultV2WithdrawAction,
} from "../../types";

// VaultV2 should definitely be a class

export interface VaultV2Actions {
  getData: () => Promise<Awaited<ReturnType<typeof fetchVaultV2>>>;
  deposit: (params: { assets: bigint }) => Promise<{
    tx: Readonly<Transaction<VaultV2DepositAction>>;
    getRequirements: () => Promise<
      Readonly<Transaction<ERC20ApprovalAction>[]>
    >;
  }>;
  withdraw: (params: { assets: bigint }) => {
    tx: Readonly<Transaction<VaultV2WithdrawAction>>;
  };
  redeem: (params: { shares: bigint }) => {
    tx: Readonly<Transaction<VaultV2RedeemAction>>;
  };
}

function _instantiateVaultV2(
  client: MorphoClient,
  vault: Address,
): VaultV2Actions {
  // I'm a bit confused by references etc: I feel like we could easily end up sending a tx with the wrong reciever
  // This could happen if I instanciate a vault V2 with this function, switch user and execute a tx generated with the previously instanciated vault
  // I would rather not rely on the client to retrieve user address but rather pass it as arg
  const userAddress = client.walletClient.account?.address;
  if (!userAddress) {
    throw new Error("User address not found");
  }
  const chainId = client.walletClient.chain?.id;
  if (!chainId) {
    throw new Error("Chain ID not found");
  }

  return {
    getData: withTelemetry("vaultV2.getData", async () =>
      fetchVaultV2(vault, client.walletClient),
    ),
    deposit: async ({ assets }: { assets: bigint }) => {
      const vaultData = await fetchVaultV2(vault, client.walletClient);

      return {
        tx: depositVaultV2({
          chainId,
          asset: vaultData.asset,
          vault,
          assets,
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

export const instantiateVaultV2 = withTelemetry(
  "vaultV2.instantiate",
  _instantiateVaultV2,
);
