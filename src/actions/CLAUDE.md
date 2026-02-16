# Actions Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Pure functions that build deep-frozen `Transaction<TAction>` objects. Two sub-layers:

## `vaultV2/` — Vault Operations

| Function          | Route                     | Why                                                    |
| ----------------- | ------------------------- | ------------------------------------------------------ |
| `vaultV2Deposit`  | Bundler (general adapter) | Enforces `maxSharePrice` — inflation attack prevention |
| `vaultV2Withdraw` | Direct vault call         | No attack surface, simpler UX                          |
| `vaultV2Redeem`   | Direct vault call         | No attack surface, simpler UX                          |

## `requirements/` — Approval Resolution

Resolves token approval needs before a deposit:

1. `supportSignature: false` → classic `approve()` tx (`getRequirementsApproval`).
2. `supportSignature: true` + EIP-2612 → permit signature (`getRequirementsPermit`).
3. `supportSignature: true` + no EIP-2612 → permit2 fallback (`getRequirementsPermit2`).

`encode/` sub-folder: low-level calldata encoders for each approval type.

## Key Constraints

- Every returned object must be `deepFreeze`-d.
- Validate inputs (`assets > 0`, `maxSharePrice > 0`) and throw dedicated errors.
- Append metadata via `addTransactionMetadata` only when provided.
