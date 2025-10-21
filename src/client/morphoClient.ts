import { Address, type WalletClient } from "viem";
import { MorphoClient, createVaultV2 } from "src";

export function createMorphoClient(walletClient: WalletClient): MorphoClient {
  const client: MorphoClient = {
    walletClient,
    vaultV2: ({ asset, vault }: { asset: Address; vault: Address }) =>
      createVaultV2(client, asset, vault),
  };

  return client;
}
