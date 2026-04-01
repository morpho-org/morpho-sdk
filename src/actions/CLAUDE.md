# Actions Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Pure functions that build deep-frozen `Transaction<TAction>` objects. Three sub-layers:

## `vaultV1/` — VaultV1 (MetaMorpho) Operations

| Function           | Route                     | Why                                                    |
| ------------------ | ------------------------- | ------------------------------------------------------ |
| `vaultV1Deposit`   | Bundler (general adapter) | Enforces `maxSharePrice` — inflation attack prevention. Supports native ETH wrapping via `nativeAmount`. |
| `vaultV1Withdraw`  | Direct vault call         | No attack surface, simpler UX                          |
| `vaultV1Redeem`    | Direct vault call         | No attack surface, simpler UX                          |

## `vaultV2/` — VaultV2 Operations

| Function                  | Route                     | Why                                                    |
| ------------------------- | ------------------------- | ------------------------------------------------------ |
| `vaultV2Deposit`          | Bundler (general adapter) | Enforces `maxSharePrice` — inflation attack prevention. Supports native ETH wrapping via `nativeAmount`. |
| `vaultV2Withdraw`         | Direct vault call         | No attack surface, simpler UX                          |
| `vaultV2Redeem`           | Direct vault call         | No attack surface, simpler UX                          |
| `vaultV2ForceWithdraw`    | VaultV2 multicall         | Bundles N forceDeallocate + 1 withdraw to exit illiquid positions |
| `vaultV2ForceRedeem`      | VaultV2 multicall         | Bundles N forceDeallocate + 1 redeem for maximum withdrawal scenarios |

## `requirements/` — Approval Resolution

Resolves token approval needs before a deposit:

1. `supportSignature: false` → classic `approve()` tx (`getRequirementsApproval`).
2. `supportSignature: true` + EIP-2612 → permit signature (`getRequirementsPermit`).
3. `supportSignature: true` + no EIP-2612 → permit2 fallback (`getRequirementsPermit2`).

`encode/` sub-folder: low-level calldata encoders for each approval type.

## Key Constraints

- Every returned object must be `deepFreeze`-d.
- Validate inputs (`assets > 0`, `maxSharePrice > 0`, `nativeAmount >= 0`) and throw dedicated errors.
- For deposits with `nativeAmount`: validate vault asset is `wNative`, prepend `nativeTransfer` + `wrapNative` bundler actions, set `tx.value`.
- Append metadata via `addTransactionMetadata` only when provided.
