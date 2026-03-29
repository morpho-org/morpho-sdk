import type { Address, Client } from "viem";
import type {
  MarketV1Actions,
  VaultV1Actions,
  VaultV2Actions,
} from "../entities";
import type { MarketParamsInput } from "./entity";
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
  marketV1: (
    marketParams: MarketParamsInput,
    chainId: number,
  ) => MarketV1Actions;
}
