# Types Layer

> Full context: [AGENTS.md](../../AGENTS.md)

Centralized type definitions. Barrel-exported via `index.ts`.

## Intent

- `BaseAction<TType, TArgs>` — discriminated union base, keyed on `type`.
- `Transaction<TAction>` — immutable `{ to, value, data, action }`.
- `Requirement` / `RequirementSignature` — permit/permit2 sign flow.
- `Metadata` — optional `{ origin, timestamp? }` for calldata tracing.
- `DepositAmountArgs` — union type enforcing at least one of `amount` / `nativeAmount`. Reused for vault deposits and market collateral supply.
- `MarketParamsInput` — Morpho Blue market params (`loanToken`, `collateralToken`, `oracle`, `irm`, `lltv`). In `entity.ts`.
- `MorphoAuthorizationAction` — for `morpho.setAuthorization()` pre-requisite transactions.
- Custom errors in `error.ts` — one class per error case. Market-specific: `BorrowExceedsSafeLtvError`, `MissingMarketPriceError`, `NegativeLltvBufferError`, `ExcessiveLltvBufferError`, `ZeroCollateralAmountError`, `NativeAmountOnNonWNativeCollateralError`.

## Key Constraints

- All properties `readonly`. No mutable interfaces.
- New operation → add its action interface here + extend `TransactionAction` union.
- New error case → dedicated class in `error.ts`, never generic `Error`.
