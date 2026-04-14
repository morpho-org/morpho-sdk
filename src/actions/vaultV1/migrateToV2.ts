import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  NegativeMinRedeemSharePriceError,
  NonPositiveMaxSharePriceError,
  type Transaction,
  type VaultV1MigrateToV2Action,
} from "../../types";

/** Solidity `type(uint256).max` — used as sentinel for "all shares" / "entire balance". */
const MAX_UINT_256 = 2n ** 256n - 1n;

/** Parameters for {@link vaultV1MigrateToV2}. */
export interface VaultV1MigrateToV2Params {
  vault: {
    readonly chainId: number;
    readonly address: Address;
  };
  args: {
    readonly targetVault: Address;
    /** Minimum acceptable share price for V1 redeem (slippage protection, in RAY). */
    readonly minSharePrice: bigint;
    /** Maximum acceptable share price for V2 deposit (inflation protection, in RAY). */
    readonly maxSharePrice: bigint;
    /** Receives the V2 vault shares. */
    readonly recipient: Address;
    /** V1 share owner whose position is being migrated. */
    readonly owner: Address;
  };
  metadata?: Metadata;
}

/**
 * Prepares an atomic full-migration transaction from VaultV1 to VaultV2.
 *
 * Routed through bundler3: redeems all V1 shares via `erc4626Redeem` (with
 * `type(uint256).max` to redeem the owner's full balance), then deposits the
 * resulting assets into V2 via `erc4626Deposit` (with `type(uint256).max` to
 * deposit the adapter's entire balance). Both operations execute atomically
 * in a single transaction.
 *
 * **Prerequisite:** The owner must approve GeneralAdapter1 to spend their V1
 * vault shares. Use `getRequirements()` on the entity to check and obtain the
 * approval transaction.
 *
 * @param params - The migration parameters.
 * @param params.vault.chainId - The chain ID (used to resolve bundler addresses).
 * @param params.vault.address - The VaultV1 (MetaMorpho) address.
 * @param params.args.targetVault - The VaultV2 address to deposit into.
 * @param params.args.minSharePrice - Minimum V1 share price in RAY (slippage protection for redeem).
 * @param params.args.maxSharePrice - Maximum V2 share price in RAY (inflation protection for deposit).
 * @param params.args.recipient - Receives the V2 vault shares.
 * @param params.args.owner - V1 share owner whose position is migrated.
 * @param params.metadata - Optional analytics metadata.
 * @returns Deep-frozen transaction.
 */
export const vaultV1MigrateToV2 = ({
  vault: { chainId, address: sourceVault },
  args: { targetVault, minSharePrice, maxSharePrice, recipient, owner },
  metadata,
}: VaultV1MigrateToV2Params): Readonly<
  Transaction<VaultV1MigrateToV2Action>
> => {
  if (minSharePrice < 0n) {
    throw new NegativeMinRedeemSharePriceError(sourceVault);
  }

  if (maxSharePrice <= 0n) {
    throw new NonPositiveMaxSharePriceError(targetVault);
  }

  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  const actions: Action[] = [
    {
      type: "erc4626Redeem",
      args: [
        sourceVault,
        MAX_UINT_256,
        minSharePrice,
        generalAdapter1,
        owner,
        false /* skipRevert */,
      ],
    },
    {
      type: "erc4626Deposit",
      args: [
        targetVault,
        MAX_UINT_256,
        maxSharePrice,
        recipient,
        false /* skipRevert */,
      ],
    },
  ];

  let tx = BundlerAction.encodeBundle(chainId, actions);

  if (metadata) {
    tx = addTransactionMetadata(tx, metadata);
  }

  return deepFreeze({
    ...tx,
    action: {
      type: "vaultV1MigrateToV2",
      args: {
        sourceVault,
        targetVault,
        recipient,
      },
    },
  });
};
