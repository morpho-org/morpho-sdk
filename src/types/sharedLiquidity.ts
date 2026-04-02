import type { MarketParams } from "@morpho-org/blue-sdk";
import type { Address } from "viem";

/** A single withdrawal from a source market within a vault reallocation. */
export interface ReallocationWithdrawal {
  readonly marketParams: MarketParams;
  readonly amount: bigint;
}

/**
 * A computed reallocation for a single vault.
 *
 * Maps 1:1 to a `PublicAllocator.reallocateTo()` call.
 * Withdraws from source markets and supplies to the target market.
 */
export interface VaultReallocation {
  readonly vault: Address;
  /** Fee in native token (ETH) paid to the PublicAllocator for this vault. */
  readonly fee: bigint;
  /** Source markets to withdraw from before supplying to the target market. */
  readonly withdrawals: readonly ReallocationWithdrawal[];
}
