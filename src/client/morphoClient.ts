import type { Address, Client } from "viem";
import { initTelemetry } from "../telemetry";
import { type Metadata, type MorphoClient } from "../types";
import { instantiateVaultV2 } from "../entities";
import type { Metadata, MorphoClient } from "../types";

/**
 * Create a Morpho client instance
 *
 * @param walletClient - Viem wallet client
 * @param metadata - Optional transaction metadata
 * @param sentryDsn - Optional Sentry DSN (can also be set via SENTRY_DSN env var)
 *                     Note: Sentry DSNs are safe to expose publicly - they're designed for client-side use
 */
export function createMorphoClient(
  walletClient: Client,
  metadata?: Metadata,
  sentryDsn?: string
): MorphoClient {
  initTelemetry(sentryDsn);

  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => instantiateVaultV2(client, vault),
  };

  return client;
}
