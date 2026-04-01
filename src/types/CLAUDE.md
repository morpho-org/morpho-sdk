# Types Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Centralized type definitions. Barrel-exported via `index.ts`.

## Intent

- `BaseAction<TType, TArgs>` — discriminated union base, keyed on `type`.
- `Transaction<TAction>` — immutable `{ to, value, data, action }`.
- `Requirement` / `RequirementSignature` — permit/permit2 sign flow.
- `Metadata` — optional `{ origin, timestamp? }` for calldata tracing.
- `DepositAmountArgs` — union type enforcing at least one of `amount` / `nativeAmount`.
- Custom errors in `error.ts` — one class per error case (includes `NativeAmountOnNonWNativeVaultError`, `ChainWNativeMissingError`, `NegativeNativeAmountError`, `ZeroDepositAmountError` for native wrapping validation).

## Key Constraints

- All properties `readonly`. No mutable interfaces.
- New vault operation → add its action interface here + extend `TransactionAction` union.
- New error case → dedicated class in `error.ts`, never generic `Error`.
