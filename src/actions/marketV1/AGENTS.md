# MarketV1 (Morpho Blue) Operations

> Parent: [`src/actions/AGENTS.md`](../AGENTS.md)

Pure transaction builders for Morpho Blue market interactions.

## Functions

### `marketV1SupplyCollateral`

Dual-path supply collateral.

| Path   | When               | Route                    | Spender          |
| ------ | ------------------ | ------------------------ | ---------------- |
| Direct | no `nativeAmount`  | `morpho.supplyCollateral()` | Morpho contract  |
| Bundler| `nativeAmount > 0` | `nativeTransfer` + `wrapNative` + `morphoSupplyCollateral` via GeneralAdapter1 | GeneralAdapter1 |

- `DepositAmountArgs`: at least one of `amount` / `nativeAmount`.
- Collateral token must be wNative for native wrapping.
- Zero loss: exact `totalCollateral` reaches Morpho.

### `marketV1Borrow`

Direct `morpho.borrow()` call. Specifies exact asset amount (`shares = 0`).

- No bundler, no requirements.
- On-chain health check enforces LLTV.

### `marketV1SupplyCollateralBorrow`

Atomic bundled: collateral transfer + `morphoSupplyCollateral` + `morphoBorrow`.

- GeneralAdapter1 must be authorized on Morpho (`setAuthorization`).
- `morphoBorrow` args: `[marketParams, borrowAmount, 0n (shares), 0n (minSharePrice), receiver, false]`.
- `onBehalf` for supply collateral = user. Borrow `onBehalf` = initiator (handled by adapter).
- Supports `nativeAmount` wrapping for collateral.
- Zero loss: all collateral to Morpho, all borrowed tokens to receiver.

## Common Pattern

1. **Validate** inputs (dedicated errors).
2. **Encode** calldata (`BundlerAction.encodeBundle` for bundler, `encodeFunctionData` for direct).
3. **Append metadata** if provided.
4. **Deep-freeze** and return `{ ...tx, action: { type, args } }`.
