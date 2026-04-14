# VaultV1 MigrateToV2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an atomic full-migration action that moves an entire VaultV1 (MetaMorpho) position into a VaultV2 vault via a single bundler3 transaction.

**Architecture:** A new action function `vaultV1MigrateToV2` encodes a bundler3 bundle with two ERC4626 operations: `erc4626Redeem(v1, type(uint256).max)` followed by `erc4626Deposit(v2, type(uint256).max)`. The entity method `migrateToV2` on `MorphoVaultV1` computes slippage-protected share prices from both vaults' accrual data and delegates to the action. The GeneralAdapter1 contract interprets `type(uint256).max` as "all shares" / "entire balance", eliminating estimation or dust issues.

**Tech Stack:** TypeScript, viem, `@morpho-org/bundler-sdk-viem` (BundlerAction), `@morpho-org/blue-sdk` (MathLib, getChainAddresses), vitest (testing on forked mainnet)

---

### Task 1: Add `VaultV1MigrateToV2Action` type and extend the union

**Files:**
- Modify: `src/types/action.ts`

- [ ] **Step 1: Add the action interface and extend the union**

In `src/types/action.ts`, add the new interface after `VaultV1RedeemAction` (around line 103) and add it to the `TransactionAction` union:

```typescript
export interface VaultV1MigrateToV2Action
  extends BaseAction<
    "vaultV1MigrateToV2",
    {
      sourceVault: Address;
      targetVault: Address;
      recipient: Address;
    }
  > {}
```

Then add `VaultV1MigrateToV2Action` to the `TransactionAction` union (after `VaultV1RedeemAction`):

```typescript
export type TransactionAction =
  | ERC20ApprovalAction
  | VaultV2DepositAction
  | VaultV2WithdrawAction
  | VaultV2RedeemAction
  | VaultV2ForceWithdrawAction
  | VaultV2ForceRedeemAction
  | VaultV1DepositAction
  | VaultV1WithdrawAction
  | VaultV1RedeemAction
  | VaultV1MigrateToV2Action
  | MarketV1SupplyCollateralAction
  | MarketV1BorrowAction
  | MarketV1SupplyCollateralBorrowAction
  | MarketV1RepayAction
  | MarketV1WithdrawCollateralAction
  | MarketV1RepayWithdrawCollateralAction
  | MorphoAuthorizationAction;
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm build`
Expected: PASS (no type errors)

- [ ] **Step 3: Commit**

```bash
git add src/types/action.ts
git commit -m "feat(types): add VaultV1MigrateToV2Action to action types"
```

---

### Task 2: Create the `vaultV1MigrateToV2` action function

**Files:**
- Create: `src/actions/vaultV1/migrateToV2.ts`
- Modify: `src/actions/vaultV1/index.ts`

- [ ] **Step 1: Write the action unit test file**

Create `src/actions/vaultV1/migrateToV2.test.ts`:

```typescript
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  GauntletWethVaultV1,
  SteakhouseUsdcVaultV1,
} from "../../../test/fixtures/vaultV1";
import { KeyrockUsdcVaultV2, KpkWETHVaultV2 } from "../../../test/fixtures/vaultV2";
import { test } from "../../../test/setup";
import { NonPositiveMaxSharePriceError } from "../../types";
import { vaultV1MigrateToV2 } from "./migrateToV2";

describe("vaultV1MigrateToV2 unit tests", () => {
  test("should create migrate transaction for USDC vaults", async ({
    client,
  }) => {
    const minSharePrice = 1000000000000000000000000000n;
    const maxSharePrice = 1000000000000000000000000000n;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice,
        maxSharePrice,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should create migrate transaction for WETH vaults", async ({
    client,
  }) => {
    const minSharePrice = 1000000000000000000000000000n;
    const maxSharePrice = 1000000000000000000000000000n;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: GauntletWethVaultV1.address,
      },
      args: {
        targetVault: KpkWETHVaultV2.address,
        minSharePrice,
        maxSharePrice,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(GauntletWethVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KpkWETHVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should allow different recipient and owner addresses", async ({
    client,
  }) => {
    const differentRecipient =
      "0x1234567890123456789012345678901234567890" as const;

    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice: 1000000000000000000000000000n,
        maxSharePrice: 1000000000000000000000000000n,
        recipient: differentRecipient,
        owner: client.account.address,
      },
    });

    expect(tx.action.args.recipient).toBe(differentRecipient);
  });

  test("should throw NonPositiveMaxSharePriceError when maxSharePrice is zero", async ({
    client,
  }) => {
    expect(() =>
      vaultV1MigrateToV2({
        vault: {
          chainId: mainnet.id,
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          targetVault: KeyrockUsdcVaultV2.address,
          minSharePrice: 1000000000000000000000000000n,
          maxSharePrice: 0n,
          recipient: client.account.address,
          owner: client.account.address,
        },
      }),
    ).toThrow(NonPositiveMaxSharePriceError);
  });

  test("should throw NonPositiveMaxSharePriceError when maxSharePrice is negative", async ({
    client,
  }) => {
    expect(() =>
      vaultV1MigrateToV2({
        vault: {
          chainId: mainnet.id,
          address: SteakhouseUsdcVaultV1.address,
        },
        args: {
          targetVault: KeyrockUsdcVaultV2.address,
          minSharePrice: 1000000000000000000000000000n,
          maxSharePrice: -1n,
          recipient: client.account.address,
          owner: client.account.address,
        },
      }),
    ).toThrow(NonPositiveMaxSharePriceError);
  });

  test("should return a deep-frozen transaction object", async ({ client }) => {
    const tx = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args: {
        targetVault: KeyrockUsdcVaultV2.address,
        minSharePrice: 1000000000000000000000000000n,
        maxSharePrice: 1000000000000000000000000000n,
        recipient: client.account.address,
        owner: client.account.address,
      },
    });

    expect(Object.isFrozen(tx)).toBe(true);
    expect(Object.isFrozen(tx.action)).toBe(true);
    expect(Object.isFrozen(tx.action.args)).toBe(true);
  });

  test("should append metadata to transaction data when provided", async ({
    client,
  }) => {
    const args = {
      targetVault: KeyrockUsdcVaultV2.address,
      minSharePrice: 1000000000000000000000000000n,
      maxSharePrice: 1000000000000000000000000000n,
      recipient: client.account.address,
      owner: client.account.address,
    } as const;

    const txWithout = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args,
    });

    const txWith = vaultV1MigrateToV2({
      vault: {
        chainId: mainnet.id,
        address: SteakhouseUsdcVaultV1.address,
      },
      args,
      metadata: { origin: "a1b2c3d4" },
    });

    expect(txWith.data.length).toBeGreaterThan(txWithout.data.length);
    expect(txWith.action.type).toBe("vaultV1MigrateToV2");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/actions/vaultV1/migrateToV2.test.ts`
Expected: FAIL — module `./migrateToV2` not found

- [ ] **Step 3: Write the action function**

Create `src/actions/vaultV1/migrateToV2.ts`:

```typescript
import { getChainAddresses } from "@morpho-org/blue-sdk";
import { type Action, BundlerAction } from "@morpho-org/bundler-sdk-viem";
import { deepFreeze } from "@morpho-org/morpho-ts";
import type { Address } from "viem";
import { addTransactionMetadata } from "../../helpers";
import {
  type Metadata,
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
```

- [ ] **Step 4: Export from barrel**

In `src/actions/vaultV1/index.ts`, add:

```typescript
export * from "./migrateToV2";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run src/actions/vaultV1/migrateToV2.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 6: Run full lint and build**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/actions/vaultV1/migrateToV2.ts src/actions/vaultV1/migrateToV2.test.ts src/actions/vaultV1/index.ts
git commit -m "feat(actions): add vaultV1MigrateToV2 action function"
```

---

### Task 3: Add `migrateToV2` method to the VaultV1 entity

**Files:**
- Modify: `src/entities/vaultV1/vaultV1.ts`

- [ ] **Step 1: Write entity-level tests**

Add the following describe block to `src/entities/vaultV1/vaultV1.test.ts` (after the existing describe blocks, inside the top-level describe):

```typescript
import type { AccrualVaultV2 } from "@morpho-org/blue-sdk";
import { fetchAccrualVaultV2 } from "@morpho-org/blue-sdk-viem";
import { KeyrockUsdcVaultV2 } from "../../../test/fixtures/vaultV2";
```

Add these imports at the top of the file alongside the existing imports. Then add the following describe block:

```typescript
  describe("migrateToV2", () => {
    test("should return buildTx and getRequirements", async ({ client }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: false,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
        mainnet.id,
      );

      const accrualVault = await vault.getData();
      const targetAccrualVault = await fetchAccrualVaultV2(
        KeyrockUsdcVaultV2.address,
        client,
        { chainId: mainnet.id },
      );

      const result = vault.migrateToV2({
        userAddress: client.account.address,
        accrualVault,
        targetAccrualVault,
      });

      expect(result.buildTx).toBeDefined();
      expect(result.getRequirements).toBeDefined();

      const tx = result.buildTx();
      expect(tx.action.type).toBe("vaultV1MigrateToV2");
      expect(tx.action.args.sourceVault).toBe(SteakhouseUsdcVaultV1.address);
      expect(tx.action.args.targetVault).toBe(KeyrockUsdcVaultV2.address);
      expect(tx.data).toBeDefined();
      expect(tx.value).toBe(0n);
    });

    test("should throw NegativeSlippageToleranceError when slippageTolerance is negative", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: false,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
        mainnet.id,
      );

      const accrualVault = await vault.getData();
      const targetAccrualVault = await fetchAccrualVaultV2(
        KeyrockUsdcVaultV2.address,
        client,
        { chainId: mainnet.id },
      );

      expect(() =>
        vault.migrateToV2({
          userAddress: client.account.address,
          accrualVault,
          targetAccrualVault,
          slippageTolerance: -1n,
        }),
      ).toThrow(NegativeSlippageToleranceError);
    });

    test("should throw ExcessiveSlippageToleranceError when slippageTolerance exceeds MAX", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: false,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
        mainnet.id,
      );

      const accrualVault = await vault.getData();
      const targetAccrualVault = await fetchAccrualVaultV2(
        KeyrockUsdcVaultV2.address,
        client,
        { chainId: mainnet.id },
      );

      expect(() =>
        vault.migrateToV2({
          userAddress: client.account.address,
          accrualVault,
          targetAccrualVault,
          slippageTolerance: MAX_SLIPPAGE_TOLERANCE + 1n,
        }),
      ).toThrow(ExcessiveSlippageToleranceError);
    });

    test("should accept slippageTolerance of exactly 0n", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client, {
        supportSignature: false,
      });
      const vault = morphoClient.vaultV1(
        SteakhouseUsdcVaultV1.address,
        mainnet.id,
      );

      const accrualVault = await vault.getData();
      const targetAccrualVault = await fetchAccrualVaultV2(
        KeyrockUsdcVaultV2.address,
        client,
        { chainId: mainnet.id },
      );

      const result = vault.migrateToV2({
        userAddress: client.account.address,
        accrualVault,
        targetAccrualVault,
        slippageTolerance: 0n,
      });

      expect(result.buildTx).toBeDefined();
      const tx = result.buildTx();
      expect(tx.data).toBeDefined();
    });
  });
```

- [ ] **Step 2: Run entity tests to verify they fail**

Run: `pnpm vitest run src/entities/vaultV1/vaultV1.test.ts`
Expected: FAIL — `vault.migrateToV2 is not a function`

- [ ] **Step 3: Implement the entity method**

In `src/entities/vaultV1/vaultV1.ts`, add the following imports alongside existing ones:

```typescript
import type { AccrualVaultV2 } from "@morpho-org/blue-sdk";
import { vaultV1MigrateToV2 } from "../../actions";
import type { VaultV1MigrateToV2Action } from "../../types";
```

Add the `migrateToV2` method signature to the `VaultV1Actions` interface (after the `redeem` method):

```typescript
  /**
   * Prepares an atomic full migration from this VaultV1 to a VaultV2.
   *
   * Redeems all V1 shares and deposits the resulting assets into V2
   * in a single bundler3 transaction.
   *
   * @param {Object} params - The migration parameters.
   * @param {Address} params.userAddress - User address (V1 share owner and V2 share recipient).
   * @param {AccrualVault} params.accrualVault - Pre-fetched V1 accrual data (for minSharePrice).
   * @param {AccrualVaultV2} params.targetAccrualVault - Pre-fetched V2 accrual data (for maxSharePrice).
   * @param {bigint} [params.slippageTolerance=DEFAULT_SLIPPAGE_TOLERANCE] - Slippage tolerance applied to both sides.
   * @returns {Object} Object with `buildTx` and `getRequirements`.
   */
  migrateToV2: (params: {
    userAddress: Address;
    accrualVault: AccrualVault;
    targetAccrualVault: AccrualVaultV2;
    slippageTolerance?: bigint;
  }) => {
    buildTx: () => Readonly<Transaction<VaultV1MigrateToV2Action>>;
    getRequirements: (params?: {
      useSimplePermit?: boolean;
    }) => Promise<(Readonly<Transaction<ERC20ApprovalAction>> | Requirement)[]>;
  };
```

Add the implementation to the `MorphoVaultV1` class (after the `redeem` method):

```typescript
  migrateToV2({
    userAddress,
    accrualVault,
    targetAccrualVault,
    slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE,
  }: {
    userAddress: Address;
    accrualVault: AccrualVault;
    targetAccrualVault: AccrualVaultV2;
    slippageTolerance?: bigint;
  }) {
    if (this.client.viemClient.chain?.id !== this.chainId) {
      throw new ChainIdMismatchError(
        this.client.viemClient.chain?.id,
        this.chainId,
      );
    }

    if (!isAddressEqual(accrualVault.address, this.vault)) {
      throw new VaultAddressMismatchError(this.vault, accrualVault.address);
    }

    if (slippageTolerance < 0n) {
      throw new NegativeSlippageToleranceError(slippageTolerance);
    }
    if (slippageTolerance > MAX_SLIPPAGE_TOLERANCE) {
      throw new ExcessiveSlippageToleranceError(slippageTolerance);
    }

    // Compute minSharePrice for V1 redeem (slippage downward — protects against
    // getting fewer assets per share). Use 1 WAD of shares as reference unit.
    const v1RefShares = MathLib.WAD;
    const v1RefAssets = accrualVault.toAssets(v1RefShares);
    const minSharePrice =
      v1RefAssets > 0n
        ? MathLib.mulDivDown(
            v1RefAssets,
            MathLib.wToRay(MathLib.WAD - slippageTolerance),
            v1RefShares,
          )
        : 0n;

    // Compute maxSharePrice for V2 deposit (slippage upward — inflation protection).
    // Same pattern as the existing deposit entity method.
    const v2RefAssets = MathLib.WAD;
    const v2RefShares = targetAccrualVault.toShares(v2RefAssets);
    const maxSharePrice =
      v2RefShares > 0n
        ? MathLib.min(
            MathLib.mulDivUp(
              v2RefAssets,
              MathLib.wToRay(MathLib.WAD + slippageTolerance),
              v2RefShares,
            ),
            MathLib.RAY * 100n,
          )
        : MathLib.RAY * 100n;

    return {
      getRequirements: async (params?: { useSimplePermit?: boolean }) => {
        // Fetch user's actual V1 share balance on-chain for precise approval amount.
        const shareBalance = await this.client.viemClient.readContract({
          address: this.vault,
          abi: [
            {
              type: "function",
              name: "balanceOf",
              inputs: [{ name: "account", type: "address" }],
              outputs: [{ name: "", type: "uint256" }],
              stateMutability: "view",
            },
          ] as const,
          functionName: "balanceOf",
          args: [userAddress],
        });

        return getRequirements(this.client.viemClient, {
          address: this.vault,
          chainId: this.chainId,
          supportSignature: this.client.options.supportSignature,
          supportDeployless: this.client.options.supportDeployless,
          useSimplePermit: params?.useSimplePermit,
          args: {
            amount: shareBalance,
            from: userAddress,
          },
        });
      },

      buildTx: () =>
        vaultV1MigrateToV2({
          vault: {
            chainId: this.chainId,
            address: this.vault,
          },
          args: {
            targetVault: targetAccrualVault.address,
            minSharePrice,
            maxSharePrice,
            recipient: userAddress,
            owner: userAddress,
          },
          metadata: this.client.options.metadata,
        }),
    };
  }
```

- [ ] **Step 4: Run entity tests to verify they pass**

Run: `pnpm vitest run src/entities/vaultV1/vaultV1.test.ts`
Expected: All tests PASS (existing + new)

- [ ] **Step 5: Run full lint and build**

Run: `pnpm lint && pnpm build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/entities/vaultV1/vaultV1.ts src/entities/vaultV1/vaultV1.test.ts
git commit -m "feat(entity): add migrateToV2 method to MorphoVaultV1"
```

---

### Task 4: Write fork integration tests

**Files:**
- Create: `test/actions/vaultV1/migrateToV2.test.ts`

- [ ] **Step 1: Write the integration test file**

Create `test/actions/vaultV1/migrateToV2.test.ts`:

```typescript
import { getChainAddresses } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  isRequirementApproval,
  MorphoClient,
} from "../../../src";
import { SteakhouseUsdcVaultV1 } from "../../fixtures/vaultV1";
import { KeyrockUsdcVaultV2 } from "../../fixtures/vaultV2";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

describe("MigrateToV2 VaultV1", () => {
  test("should create migration bundle via entity", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);

    const vaultV1 = morpho.vaultV1(SteakhouseUsdcVaultV1.address, mainnet.id);
    const accrualVault = await vaultV1.getData();

    const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
    const targetAccrualVault = await vaultV2.getData();

    const migrate = vaultV1.migrateToV2({
      userAddress: client.account.address,
      accrualVault,
      targetAccrualVault,
    });

    const tx = migrate.buildTx();

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("vaultV1MigrateToV2");
    expect(tx.action.args.sourceVault).toBe(SteakhouseUsdcVaultV1.address);
    expect(tx.action.args.targetVault).toBe(KeyrockUsdcVaultV2.address);
    expect(tx.action.args.recipient).toBe(client.account.address);
    expect(tx.to).toBeDefined();
    expect(tx.data).toBeDefined();
    expect(tx.value).toBe(0n);
  });

  test("should migrate full USDC position from V1 to V2", async ({
    client,
  }) => {
    const shares = parseUnits("1000", 18);
    await client.deal({
      erc20: SteakhouseUsdcVaultV1.address,
      amount: shares,
    });

    const {
      vaults: {
        SteakhouseUsdcVaultV1: {
          initialState: v1Initial,
          finalState: v1Final,
        },
        KeyrockUsdcVaultV2: {
          initialState: v2Initial,
          finalState: v2Final,
        },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { SteakhouseUsdcVaultV1, KeyrockUsdcVaultV2 },
      },
      actionFn: async () => {
        const morpho = new MorphoClient(client);
        const vaultV1 = morpho.vaultV1(
          SteakhouseUsdcVaultV1.address,
          mainnet.id,
        );
        const vaultV2 = morpho.vaultV2(
          KeyrockUsdcVaultV2.address,
          mainnet.id,
        );

        const accrualVault = await vaultV1.getData();
        const targetAccrualVault = await vaultV2.getData();

        const migrate = vaultV1.migrateToV2({
          userAddress: client.account.address,
          accrualVault,
          targetAccrualVault,
        });

        const requirements = await migrate.getRequirements();

        // Should have at least one approval requirement (V1 share approval for GA1)
        expect(requirements.length).toBeGreaterThanOrEqual(1);

        for (const req of requirements) {
          if (isRequirementApproval(req)) {
            await client.sendTransaction(req);
          }
        }

        const tx = migrate.buildTx();
        await client.sendTransaction(tx);
      },
    });

    // V1: all shares should be gone
    expect(v1Final.userSharesBalance).toBe(0n);
    expect(v1Final.userSharesBalance).toBeLessThan(v1Initial.userSharesBalance);

    // V2: user should have received shares
    expect(v2Final.userSharesBalance).toBeGreaterThan(
      v2Initial.userSharesBalance,
    );

    // User's underlying asset balance should be roughly unchanged
    // (assets moved vault-to-vault, not through user's wallet)
    expect(v1Final.userAssetBalance).toEqual(v1Initial.userAssetBalance);
  });
});
```

- [ ] **Step 2: Run integration tests**

Run: `pnpm vitest run test/actions/vaultV1/migrateToV2.test.ts`
Expected: All tests PASS

Note: These tests require `MAINNET_RPC_URL` environment variable to be set for the forked mainnet.

- [ ] **Step 3: Commit**

```bash
git add test/actions/vaultV1/migrateToV2.test.ts
git commit -m "test: add fork integration tests for vaultV1MigrateToV2"
```

---

### Task 5: Final validation

**Files:** None (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: All existing tests PASS, all new tests PASS

- [ ] **Step 2: Run lint and build**

Run: `pnpm lint && pnpm build`
Expected: PASS with zero errors

- [ ] **Step 3: Verify exports are accessible**

Run: `pnpm vitest run -t "migrateToV2"` to confirm all migrateToV2 tests are discovered across all three test levels.

- [ ] **Step 4: Final commit if any fixups were needed**

Only if previous steps required fixes.
