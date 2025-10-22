import { type WalletClient } from "viem";
import { MorphoClient, MorphoMetadata, VaultParams } from "src";
import { createVaultV2WithClient } from "src/entities/vault/vaultV2";

export function createMorphoClient(
  walletClient: WalletClient,
  metadata?: MorphoMetadata
): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: ({ vault, asset }: VaultParams) =>
      createVaultV2WithClient(client, { vault, asset }),
  };

  return client;
}
