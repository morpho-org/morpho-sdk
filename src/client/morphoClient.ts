import type { Address, Client } from "viem";
import { instantiateVaultV2 } from "../entities";
import {
  type MorphoClient as IMorphoClient,
  type Metadata,
  MissingAddressError,
  MissingChainIdError,
} from "../types";

export class MorphoClient implements IMorphoClient {
  public readonly viemClient: Client;
  public readonly metadata?: Metadata;

  constructor(client: Client, metadata?: Metadata) {
    this.viemClient = client;
    this.metadata = metadata;
  }

  public get userAddress(): Address {
    const address = this.viemClient.account?.address;
    if (!address) {
      throw new MissingAddressError();
    }
    return address;
  }

  public get chainId(): number {
    const id = this.viemClient.chain?.id;
    if (!id) {
      throw new MissingChainIdError();
    }
    return id;
  }

  vaultV2(vault: Address) {
    return instantiateVaultV2(this, vault);
  }
}

/**
 * Creates a new MorphoClient instance to interact with Morpho Blue protocol contracts.
 *
 * @param account - A viem Wallet Client for signing and sending transactions.
 * @param metadata - Optional. Attach custom metadata to all actions via this client.
 * @returns MorphoClient instance
 *
 * @example
 * import { createMorphoClient } from "...";
 * const morpho = createMorphoClient(walletClient);
 */
export function createMorphoClient(
  client: Client,
  metadata?: Metadata,
): MorphoClient {
  return new MorphoClient(client, metadata);
}
