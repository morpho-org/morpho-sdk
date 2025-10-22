import { depositVaultV2, MorphoClient, Transaction, VaultParams } from "src";
import { Address } from "viem";

export interface VaultV2Actions {
  deposit: (params: { amount: bigint; recipient?: Address }) => Transaction;
}

export function createVaultV2WithClient(
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

export function createVaultV2({
  chainId,
  vault,
  asset,
}: {
  chainId: number;
  vault: Address;
  asset: Address;
}) {
  return {
    deposit: ({ amount, recipient }: { amount: bigint; recipient: Address }) =>
      depositVaultV2({ chainId, asset, vault, amount, recipient }),
  };
}
