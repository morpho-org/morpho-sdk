import { type WalletClient } from "viem";
import {
  MorphoClient,
  MorphoMetadata,
  VaultParams,
  createVaultV2WithClient,
} from "src";

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
