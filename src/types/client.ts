import type { Address, Client } from "viem";
import type { VaultV1Actions, VaultV2Actions } from "../entities";
import type { Metadata } from "./index";

export interface MorphoClientType {
  readonly viemClient: Client;
  readonly options: {
    readonly supportSignature: boolean;
    readonly supportDeployless?: boolean;
    readonly metadata?: Metadata;
  };

  vaultV1: (vault: Address, chainId: number) => VaultV1Actions;
  vaultV2: (vault: Address, chainId: number) => VaultV2Actions;
}
