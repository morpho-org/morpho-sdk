import type { Address, Client } from "viem";
import { instantiateVaultV2 } from "../entities";
import type { Metadata, MorphoClient } from "../types";

export function createMorphoClient(
  walletClient: Client,
  metadata?: Metadata,
): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => instantiateVaultV2(client, vault),
  };

  return client;
}
