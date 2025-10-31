import { Metadata } from "./metadata";
import { Client, Address } from "viem";
import { VaultV2Actions } from "../entities/vault/vaultV2";

export interface MorphoClient {
  walletClient: Client;
  metadata?: Metadata;
  vaultV2: (vault: Address) => Promise<VaultV2Actions>;
}
