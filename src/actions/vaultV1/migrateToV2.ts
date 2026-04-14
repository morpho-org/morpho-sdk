import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
  NegativeMinRedeemSharePriceError,
  NonPositiveMaxSharePriceError,
  type RequirementSignature,
  type Transaction,
  type VaultV1MigrateToV2Action,
} from "../../types";
import { getRequirementsAction } from "../requirements/getRequirementsAction";

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
    /** Pre-signed permit/permit2 approval for V1 share transfer. */
    readonly requirementSignature?: RequirementSignature;
  };
  metadata?: Metadata;
}

/**
 * Prepares an atomic full-migration transaction from VaultV1 to VaultV2.
 *
 * Routed through bundler3: transfers V1 shares to GeneralAdapter1 (via
 * `erc20TransferFrom` or permit/permit2), redeems them via `erc4626Redeem`
 * (GA1 redeems its own shares — no allowance check), then deposits the
 * resulting assets into V2 via `erc4626Deposit`. All operations execute
 * atomically in a single transaction.
 *
 * **Prerequisite:** The user must either approve GeneralAdapter1 to spend
 * their V1 vault shares (classic approve) or provide a pre-signed
 * permit/permit2 via `requirementSignature`. Use `getRequirements()` on the
 * entity to resolve the appropriate approval.
 *
 * @param params - The migration parameters.
 * @param params.vault.chainId - The chain ID (used to resolve bundler addresses).
 * @param params.vault.address - The VaultV1 (MetaMorpho) address.
 * @param params.args.targetVault - The VaultV2 address to deposit into.
 * @param params.args.minSharePrice - Minimum V1 share price in RAY (slippage protection for redeem).
 * @param params.args.maxSharePrice - Maximum V2 share price in RAY (inflation protection for deposit).
 * @param params.args.recipient - Receives the V2 vault shares.
 * @param params.args.requirementSignature - Pre-signed permit/permit2 for V1 share transfer.
 * @param params.metadata - Optional analytics metadata.
 * @returns Deep-frozen transaction.
 */
export const vaultV1MigrateToV2 = ({
  vault: { chainId, address: sourceVault },
  args: {
    targetVault,
    minSharePrice,
    maxSharePrice,
    recipient,
    requirementSignature,
  },
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

  const actions: Action[] = [];

  // Transfer V1 shares from user to GA1.
  // With a signature: permit/permit2 + transferFrom for the signed amount.
  // Without: plain erc20TransferFrom with MAX_UINT_256 (adapter resolves to
  // initiator's full balance).
  if (requirementSignature) {
    actions.push(
      ...getRequirementsAction({
        chainId,
        asset: sourceVault,
        amount: requirementSignature.args.amount,
        requirementSignature,
      }),
    );
  } else {
    actions.push({
      type: "erc20TransferFrom",
      args: [
        sourceVault,
        MAX_UINT_256,
        generalAdapter1,
        false /* skipRevert */,
      ],
    });
  }

  // GA1 redeems its own shares (owner = GA1, no allowance check).
  actions.push({
    type: "erc4626Redeem",
    args: [
      sourceVault,
      MAX_UINT_256,
      minSharePrice,
      generalAdapter1,
      generalAdapter1,
      false /* skipRevert */,
    ],
  });

  // Deposit all resulting assets into V2.
  actions.push({
    type: "erc4626Deposit",
    args: [
      targetVault,
      MAX_UINT_256,
      maxSharePrice,
      recipient,
      false /* skipRevert */,
    ],
  });

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
