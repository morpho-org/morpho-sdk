import type { Address, Client } from "viem";
import { instantiateVaultV2 } from "../entities";
import type { MorphoClient as IMorphoClient, Metadata } from "../types";

export class MorphoClient implements IMorphoClient {
  public readonly walletClient: Client;
  public readonly metadata?: Metadata;

  constructor(walletClient: Client, metadata?: Metadata) {
    this.walletClient = walletClient;
    this.metadata = metadata;
  }

  vaultV2(vault: Address) {
    return instantiateVaultV2(this, vault);
  }
}

/**
 * Creates a new MorphoClient instance to interact with Morpho Blue protocol contracts.
 *
 * @param walletClient - A viem Wallet Client for signing and sending transactions.
 * @param metadata - Optional. Attach custom metadata to all actions via this client.
 * @returns MorphoClient instance
 *
 * @example
 * import { createMorphoClient } from "...";
 * const morpho = createMorphoClient(walletClient);
 */
export function createMorphoClient(
  walletClient: Client,
  metadata?: Metadata,
): MorphoClient {
  return new MorphoClient(walletClient, metadata);
}
