import { VaultV2Actions } from "../../src";
import { Client, Address } from "viem";

export interface MorphoMetadata {
  origin?: string;
  timestamp?: boolean;
}

export interface MorphoClient {
  walletClient: Client;
  metadata?: MorphoMetadata;
  vaultV2: (vault: Address) => Promise<VaultV2Actions>;
}
