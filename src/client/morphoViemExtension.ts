import type { Client } from "viem";
import type { Metadata } from "../types";
import { MorphoClient } from "./morphoClient";

/**
 * Morpho extension for viem clients.
 * Adds `morpho` namespace to viem clients with vaultV2 actions.
 *
 * @param metadata - (Optional) Metadata object that will be passed to all morpho actions. If provided, this metadata can be used for analytics, logging, or to carry additional information with each action.
 * @returns Extension function that adds morpho namespace to viem clients
 *
 * @example
 * ```ts
 * import { createWalletClient, http } from 'viem';
 * import { mainnet } from 'viem/chains';
 * import { morpho } from '@morpho-org/consumer-sdk';
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: http(),
 *   account: '0x...',
 * }).extend(morphoViemExtension());
 *
 * // Use morpho actions
 * const vault = client.morpho.vaultV2('0x...');
 * const deposit = await vault.deposit({ assets: 1000000000000000000n });
 * ```
 */
export function morphoViemExtension(metadata?: Metadata) {
  return <TClient extends Client>(client: TClient) => {
    return {
      morpho: new MorphoClient(client, metadata),
    };
  };
}
