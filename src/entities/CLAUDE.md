# Entity Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

`MorphoVaultV2` implements `VaultV2Actions`. Bridges Client → Actions.

## Intent

- Fetches on-chain vault data (`fetchVaultV2`, `fetchAccrualVaultV2`).
- Computes derived values (e.g. `maxSharePrice` with slippage).
- Delegates transaction building to pure action functions.
- Returns `{ buildTx, getRequirements }` — lazy evaluation, no side effects at construction.

## Key Constraints

- Validate `chainId` match before any on-chain call.
- Never encode calldata here — that belongs in Actions.
- Deposit goes through the bundler (via `vaultV2Deposit`). ForceWithdraw goes through VaultV2's native multicall (via `vaultV2ForceWithdraw`). Withdraw/redeem are direct vault calls.
