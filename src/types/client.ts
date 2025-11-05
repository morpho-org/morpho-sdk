import type { Address, Client } from "viem";
import type { VaultV2Actions } from "../entities";
import type { Metadata } from "./index";

export interface MorphoClient {
  walletClient: Client;
  metadata?: Metadata;
  vaultV2: (vault: Address) => VaultV2Actions;
}
