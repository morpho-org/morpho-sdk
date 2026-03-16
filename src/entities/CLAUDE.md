# Entity Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

`MorphoVaultV1` implements `VaultV1Actions`. `MorphoVaultV2` implements `VaultV2Actions`. Both bridge Client → Actions.

## Intent

- Fetches on-chain vault data (`fetchVault`/`fetchAccrualVault` for V1, `fetchVaultV2`/`fetchAccrualVaultV2` for V2).
- Computes derived values (e.g. `maxSharePrice` with slippage).
- Delegates transaction building to pure action functions.
- Returns `{ buildTx, getRequirements }` — lazy evaluation, no side effects at construction.

## Key Constraints

- Validate `chainId` match before any on-chain call.
- Never encode calldata here — that belongs in Actions.
- Deposits go through the bundler (both V1 and V2). Withdraw/redeem are direct vault calls. ForceWithdraw/ForceRedeem (V2 only) go through VaultV2's native multicall.
