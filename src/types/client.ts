import { VaultV2Actions, Metadata } from "../../src";
import { Client, Address } from "viem";

export interface MorphoClient {
  walletClient: Client;
  metadata?: Metadata;
  vaultV2: (vault: Address) => Promise<VaultV2Actions>;
}
