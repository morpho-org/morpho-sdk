import type { Address, Client } from "viem";
import { instantiateVaultV2 } from "../entities";
import {
  type MorphoClient as IMorphoClient, // This is Highly misleading to have the type having the same name as the class + it will create an error if you export all at root
  type Metadata,
  MissingAddressError,
  MissingChainIdError,
} from "../types";

export class MorphoClient implements IMorphoClient {
  // You should declare these directly in constructor to avoid wordy asignement
  public readonly viemClient: Client;
  public readonly metadata?: Metadata; // The metadata are dynamic, submission timestamp depends on when tx is built

  constructor(client: Client, metadata?: Metadata) {
    this.viemClient = client;
    this.metadata = metadata;
  }

  // It is in general a bad practice IMO to have getters throw errors
  public get userAddress(): Address {
    const address = this.viemClient.account?.address;
    if (!address) {
      throw new MissingAddressError(); // In which case could it happen? The error should be more explicit
    }
    return address;
  }

  // It is in general a bad practice IMO to have getters throw errors
  public get chainId(): number {
    const id = this.viemClient.chain?.id;
    if (!id) {
      throw new MissingChainIdError(); // In which case could it happen? The error should be more explicit
    }
    return id;
  }

  vaultV2(vault: Address) {
    // I don't get the sense of this function, why not instanciating the class here directly?
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
// Why creating functions that are basically constructors?
