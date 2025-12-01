import type { Address, Client } from "viem";
import { MorphoVaultV2 } from "../entities";
import type { Metadata, MorphoClientType } from "../types";

export class MorphoClient implements MorphoClientType {
  constructor(
    public readonly viemClient: Client,
    public readonly metadata?: Metadata,
  ) {}

  vaultV2(vault: Address, chainId: number) {
    return new MorphoVaultV2(this, vault, chainId);
  }
}
