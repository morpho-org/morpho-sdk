import { Address, type WalletClient } from "viem";
import { MorphoClient, MorphoMetadata } from "src";
import { createVaultV2 } from "src/entities/vault/vaultV2";

export function createMorphoClient(
  walletClient: WalletClient,
  metadata?: MorphoMetadata
): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => createVaultV2(client, vault),
  };

  return client;
}
