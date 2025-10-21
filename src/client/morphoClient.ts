import { Address, type WalletClient } from "viem";
import { MorphoClient, VaultParams, createVaultV2 } from "src";

export function createMorphoClient(walletClient: WalletClient): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    vaultV2: ({ vault, asset }: VaultParams) =>
      createVaultV2(client, { vault, asset }),
  };

  return client;
}
