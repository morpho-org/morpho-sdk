import type { Address } from "viem";

/**
 * Structural type representing the minimal vault data needed by deposit operations.
 * Compatible with both `Vault` / `AccrualVault` (V1) and `VaultV2` / `AccrualVaultV2` (V2) from the SDK.
 */
export interface AccrualVaultData {
  readonly asset: Address;
  toShares(assets: bigint): bigint;
}

export interface VaultParams {
  vault: Address;
  asset: Address;
}
