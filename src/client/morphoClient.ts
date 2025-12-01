import type { Address, Client } from "viem";
import { VaultV2 } from "../entities";
import type { Metadata, MorphoClientType } from "../types";

export class MorphoClient implements MorphoClientType {
  constructor(
    public readonly viemClient: Client,
    public readonly metadata?: Metadata,
  ) {}

  vaultV2(vault: Address, chainId: number) {
    return new VaultV2(this, vault, chainId);
  }
}
