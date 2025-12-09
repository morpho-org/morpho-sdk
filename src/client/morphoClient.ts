import type { Address, Client } from "viem";
import { MorphoVaultV2 } from "../entities";
import type { Metadata, MorphoClientType } from "../types";

export class MorphoClient implements MorphoClientType {
  readonly options: {
    readonly supportSignature: boolean;
    readonly metadata?: Metadata;
  };
  
  constructor(
    public readonly viemClient: Client,
    readonly _options?: {
      readonly supportSignature?: boolean;
      readonly metadata?: Metadata;
    }
  ) {
    this.options = {
      ..._options,
      supportSignature: _options?.supportSignature ?? false,
    };
  }

  public vaultV2(vault: Address, chainId: number) {
    return new MorphoVaultV2(this, vault, chainId);
  }
}
