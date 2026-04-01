import type { MarketParams } from "@morpho-org/blue-sdk";
import type { Address, Client } from "viem";
import { MorphoMarketV1, MorphoVaultV1, MorphoVaultV2 } from "../entities";
import type {
  Metadata,
  MorphoClientType,
  SharedLiquidityOptions,
} from "../types";

export class MorphoClient implements MorphoClientType {
  readonly options: {
    readonly supportSignature: boolean;
    readonly supportDeployless?: boolean;
    readonly metadata?: Metadata;
    readonly sharedLiquidity?: SharedLiquidityOptions;
  };

  constructor(
    public readonly viemClient: Client,
    readonly _options?: {
      readonly supportSignature?: boolean;
      readonly supportDeployless?: boolean;
      readonly metadata?: Metadata;
      readonly sharedLiquidity?: SharedLiquidityOptions;
    },
  ) {
    this.options = {
      ..._options,
      supportSignature: _options?.supportSignature ?? false,
      supportDeployless: _options?.supportDeployless,
      sharedLiquidity: _options?.sharedLiquidity,
    };
  }

  public vaultV1(vault: Address, chainId: number) {
    return new MorphoVaultV1(this, vault, chainId);
  }

  public vaultV2(vault: Address, chainId: number) {
    return new MorphoVaultV2(this, vault, chainId);
  }

  public marketV1(marketParams: MarketParams, chainId: number) {
    return new MorphoMarketV1(this, marketParams, chainId);
  }
}
