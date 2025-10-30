import { Address, type Client } from "viem";
import { MorphoClient, MorphoMetadata, instantiateVaultV2 } from "../../src";

export function createMorphoClient(
  walletClient: Client,
  metadata?: MorphoMetadata
): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => instantiateVaultV2(client, vault),
  };

  return client;
}
