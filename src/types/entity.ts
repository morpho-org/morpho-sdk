import type { Address } from "viem";

export interface VaultParams {
  vault: Address;
  asset: Address;
}

/**
 * Input parameters for a Morpho Blue market.
 * Structurally matches the on-chain `MarketParams` struct used to identify markets.
 */
export interface MarketParamsInput {
  readonly loanToken: Address;
  readonly collateralToken: Address;
  readonly oracle: Address;
  readonly irm: Address;
  readonly lltv: bigint;
}
