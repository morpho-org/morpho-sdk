import type { MarketParams } from "@morpho-org/blue-sdk";
import type { InputSimulationState } from "@morpho-org/simulation-sdk";
import type { Address } from "viem";

/**
 * On-chain state needed to compute shared liquidity reallocations.
 *
 * Returned by `getSharedLiquidityData()`. Passed to `borrow()` or
 * `supplyCollateralBorrow()` where the reallocation algorithm runs
 * internally via `SimulationState.getMarketPublicReallocations()`.
 */
export interface SharedLiquidityData {
  readonly simulationState: InputSimulationState;
}

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
