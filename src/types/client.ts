import type { Address, Client } from "viem";
import type { VaultV2Actions } from "../entities";
import type { Metadata } from "./index";

export interface MorphoClientType {
  readonly viemClient: Client;
  readonly supportSignature: boolean;
  readonly metadata?: Metadata;
  vaultV2: (vault: Address, chainId: number) => VaultV2Actions;
}
