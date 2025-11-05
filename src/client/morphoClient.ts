import type { Address, Client } from "viem";
import { type Metadata, type MorphoClient } from "../types";
import { instantiateVaultV2 } from "../entities";

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
