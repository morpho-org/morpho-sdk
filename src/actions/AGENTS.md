# Actions Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Pure functions that build deep-frozen `Transaction<TAction>` objects. No side effects, no state.

## Sub-Layers

| Sub-layer | Path | Role | Docs |
|-----------|------|------|------|
| **Vault Operations** | `vaultV2/` | Build deposit / withdraw / redeem transactions | [`vaultV2/AGENTS.md`](vaultV2/AGENTS.md) |
| **Requirements** | `requirements/` | Resolve token approval needs before a deposit | [`requirements/AGENTS.md`](requirements/AGENTS.md) |

## Data Flow

```
Entity (MorphoVaultV2)
  │
  ├─ deposit ──► vaultV2Deposit()  ← may include requirementSignature
  ├─ withdraw ─► vaultV2Withdraw()
  └─ redeem ──► vaultV2Redeem()
                    │
                    ▼
         Readonly<Transaction<TAction>>  (deep-frozen)
```

## Key Constraints

- Every returned object **must** be `deepFreeze`-d — immutability is non-negotiable.
- Validate all inputs (`assets > 0`, `shares > 0`, `maxSharePrice > 0`) and throw dedicated errors from `src/types/error.ts`.
- Append metadata via `addTransactionMetadata` only when `metadata` param is provided.
- **Never bypass the general adapter for deposits** — it enforces `maxSharePrice` (inflation attack prevention).
- All actions extend `BaseAction<TType, TArgs>` (discriminated union on `type`).

## Exports

Barrel `index.ts` re-exports both sub-layers:

```typescript
export * from "./requirements";
export * from "./vaultV2";
```
