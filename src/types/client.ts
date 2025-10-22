import { VaultV2Actions } from "src";
import { WalletClient, Address } from "viem";

export interface MorphoMetadata {
  origin?: string;
  timestamp?: boolean;
}

export interface MorphoClient {
  walletClient: WalletClient;
  metadata?: MorphoMetadata;
  vaultV2: (params: { asset: Address; vault: Address }) => VaultV2Actions;
}
