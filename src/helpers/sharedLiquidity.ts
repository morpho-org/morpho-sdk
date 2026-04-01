import type { MarketId } from "@morpho-org/blue-sdk";
import {
  type PublicAllocatorOptions,
  type PublicReallocation,
  SimulationState,
} from "@morpho-org/simulation-sdk";
import type { Address } from "viem";
import type {
  ReallocationWithdrawal,
  SharedLiquidityData,
  VaultReallocation,
} from "../types";

/**
 * Groups raw `PublicReallocation[]` by vault and resolves fees + market params
 * from the simulation state.
 */
function groupByVault(
  withdrawals: readonly PublicReallocation[],
  simState: SimulationState,
): VaultReallocation[] {
  const byVault = new Map<
    Address,
    { fee: bigint; withdrawals: ReallocationWithdrawal[] }
  >();

  for (const w of withdrawals) {
    if (!byVault.has(w.vault)) {
      const vault = simState.getVault(w.vault);
      byVault.set(w.vault, {
        fee: vault.publicAllocatorConfig?.fee ?? 0n,
        withdrawals: [],
      });
    }

    byVault.get(w.vault)!.withdrawals.push({
      marketParams: simState.getMarket(w.id).params,
      amount: w.assets,
    });
  }

  return [...byVault.entries()].map(([vault, data]) => ({
    vault,
    fee: data.fee,
    withdrawals: data.withdrawals,
  }));
}

/**
 * Computes vault reallocations for a target market using
 * `SimulationState.getMarketPublicReallocations()`.
 *
 * Returns `VaultReallocation[]` grouped by vault, ready to be encoded
 * as `reallocateTo` bundler actions.
 *
 * @param sharedLiquidityData - On-chain state returned by `getSharedLiquidityData()`.
 * @param targetMarketId - The market to reallocate liquidity toward.
 * @param options - Public allocator options (withdrawal utilization caps, etc.).
 * @returns Computed reallocations grouped by vault. Empty array if none needed.
 */
export function computeReallocations(
  sharedLiquidityData: SharedLiquidityData,
  targetMarketId: MarketId,
  options?: PublicAllocatorOptions,
): readonly VaultReallocation[] {
  const simState = new SimulationState(sharedLiquidityData.simulationState);

  const { withdrawals } = simState.getMarketPublicReallocations(
    targetMarketId,
    {
      enabled: true,
      ...options,
    },
  );

  if (withdrawals.length === 0) return [];

  return groupByVault(withdrawals, simState);
}
