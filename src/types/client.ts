import { WalletClient, Address, Hex } from "viem";
import { VaultV2Actions } from "./action";

export interface MorphoClient {
  walletClient: WalletClient;
  vaultV2: (params: { asset: Address; vault: Address }) => VaultV2Actions;
}
