import { type MarketParams, MarketUtils } from "@morpho-org/blue-sdk";
import type { Address, Client } from "viem";
import { MorphoMarketV1, MorphoVaultV1, MorphoVaultV2 } from "../entities";
import {
  MarketIdMismatchError,
  type Metadata,
  type MorphoClientType,
} from "../types";

export class MorphoClient implements MorphoClientType {
  readonly options: {
    readonly supportSignature: boolean;
    readonly supportDeployless?: boolean;
    readonly metadata?: Metadata;
  };

  constructor(
    public readonly viemClient: Client,
    readonly _options?: {
      readonly supportSignature?: boolean;
      readonly supportDeployless?: boolean;
      readonly metadata?: Metadata;
    },
  ) {
    this.options = {
      ..._options,
      supportSignature: _options?.supportSignature ?? false,
      supportDeployless: _options?.supportDeployless,
    };
  }

  public vaultV1(vault: Address, chainId: number) {
    return new MorphoVaultV1(this, vault, chainId);
  }

  public vaultV2(vault: Address, chainId: number) {
    return new MorphoVaultV2(this, vault, chainId);
  }

  public marketV1(marketParams: MarketParams, chainId: number) {
    // Structural typing lets callers pass a plain object whose `id` does not
    // match the (loanToken, collateralToken, oracle, irm, lltv) tuple. Reads
    // key off `id`; writes encode the tuple — a mismatch silently routes the
    // two to different markets. Recompute the canonical id from the tuple
    // and reject any input whose supplied id disagrees.
    const derivedId = MarketUtils.getMarketId(marketParams);
    if (marketParams.id !== derivedId) {
      throw new MarketIdMismatchError(marketParams.id, derivedId);
    }
    return new MorphoMarketV1(this, marketParams, chainId);
  }
}
