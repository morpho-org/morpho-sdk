import type { Address, Client } from "viem";
import type { VaultV2Actions } from "../entities";
import type { Metadata } from "./index";

// Should be a class
// Would be nice to have it modular, being able to extend it with specific actions
// It would allow us to provide beta actions, easily deprecate actions, allow contributors to build their own extensions before
// We could discuss this all together
export interface MorphoClient {
  walletClient: Client;
  metadata?: Metadata;
  vaultV2: (vault: Address) => VaultV2Actions;
}
