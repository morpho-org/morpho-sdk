import type { MarketParams } from "@morpho-org/blue-sdk";
import type { Address, Client } from "viem";
import type {
  MarketV1Actions,
  VaultV1Actions,
  VaultV2Actions,
} from "../entities";
import type { Metadata } from "./index";

export interface SharedLiquidityOptions {
  /** Max utilization allowed on source markets when withdrawing (WAD). Default: 92% */
  readonly maxWithdrawalUtilization?: bigint;
}

export interface MorphoClientType {
  readonly viemClient: Client;
  readonly options: {
    readonly supportSignature: boolean;
    readonly supportDeployless?: boolean;
    readonly metadata?: Metadata;
    readonly sharedLiquidity?: SharedLiquidityOptions;
  };

  vaultV1: (vault: Address, chainId: number) => VaultV1Actions;
  vaultV2: (vault: Address, chainId: number) => VaultV2Actions;
  marketV1: (marketParams: MarketParams, chainId: number) => MarketV1Actions;
}
