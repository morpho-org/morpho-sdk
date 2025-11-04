import type { Address, Client } from "viem";
import type { VaultV2Actions } from "../entities/vault/vaultV2";
import type { Metadata } from "./metadata";

export interface MorphoClient {
  walletClient: Client;
  metadata?: Metadata;
  vaultV2: (vault: Address) => Promise<VaultV2Actions>;
}
