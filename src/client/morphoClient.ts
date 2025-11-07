import type { Address, Client } from "viem";
import { instantiateVaultV2 } from "../entities";
import type { Metadata, MorphoClient } from "../types";

// MorphoClient should be a class imo
// We could actually expose targetted actions: vaultV2Actions, morphoActions, ...
// And allow the consumer to do sth like: extendMorphoClient(client, [vaultV2Actions, morphoActions, ...])
// A bit the same way  we do for anvil client
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
