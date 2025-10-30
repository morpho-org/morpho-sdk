import { Address, type Client } from "viem";
import { MorphoClient, Metadata, instantiateVaultV2 } from "../../src";

export function createMorphoClient(
  walletClient: Client,
  metadata?: Metadata
): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => instantiateVaultV2(client, vault),
  };

  return client;
}
