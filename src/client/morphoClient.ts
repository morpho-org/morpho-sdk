import type { Address, Client } from "viem";
import { VaultV2 } from "../entities";
import {
  type Metadata,
  MissingAddressError,
  MissingChainIdError,
  type MorphoClientType,
} from "../types";

export class MorphoClient implements MorphoClientType {
  constructor(
    public readonly viemClient: Client,
    public readonly metadata?: Metadata,
  ) {}

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
    return new VaultV2(this, vault);
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
): MorphoClientType {
  return new MorphoClient(client, metadata);
}
