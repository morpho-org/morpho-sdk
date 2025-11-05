import type { Address, Client } from "viem";
import { initTelemetry, setUser } from "../telemetry";
import { type Metadata, type MorphoClient } from "../types";
import { instantiateVaultV2 } from "../entities";

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
  // Initialize telemetry if not already initialized
  // DSN can be passed directly, from env var, or left undefined (telemetry will be disabled)
  // Errors will be automatically captured by Sentry
  initTelemetry(sentryDsn);

  // Set user context if address is available
  const userAddress = walletClient.account?.address;
  if (userAddress) {
    setUser({ address: userAddress });
  }

  const client: MorphoClient = {
    walletClient,
    metadata,
    vaultV2: (vault: Address) => instantiateVaultV2(client, vault),
  };

  return client;
}
