# MarketV1 (Morpho Blue) Operations

> Parent: [`src/actions/CLAUDE.md`](../CLAUDE.md)

Pure transaction builders for Morpho Blue market interactions.

## Functions

### `marketV1SupplyCollateral`

Always routed through bundler3 via GeneralAdapter1.

| Scenario            | Actions                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| ERC20-only          | `erc20TransferFrom` + `morphoSupplyCollateral`                                   |
| With `nativeAmount` | `nativeTransfer` + `wrapNative` + (optional `erc20TransferFrom`) + `morphoSupplyCollateral` |

- `DepositAmountArgs`: at least one of `amount` / `nativeAmount`.
- Collateral token must be wNative for native wrapping.
- Spender for ERC20 approval: **GeneralAdapter1** (not Morpho contract).
- Zero loss: exact `totalCollateral` reaches Morpho.

### `marketV1Borrow`

Routed through bundler3 via `morphoBorrow`. Specifies exact asset amount (`shares = 0`).

- GeneralAdapter1 must be authorized on Morpho (`setAuthorization`).
- Uses `minSharePrice` (computed from market state + slippage tolerance) for slippage protection.
- `morphoBorrow` args: `[marketParams, amount, 0n (shares), minSharePrice, receiver, false]`.

**With reallocations** (`reallocations?: VaultReallocation[]`):

Bundle action sequence:
```
1. reallocateTo(vault, fee, withdrawals, targetMarketParams, false)  ← per VaultReallocation
   ...repeat for each reallocation...
2. morphoBorrow(marketParams, amount, 0n, minSharePrice, receiver, false)
```

- `validateReallocations()` is called before encoding (fee >= 0, non-empty withdrawals, each amount > 0).
- `reallocationFee = sum(r.fee)` → set as `tx.value`.
- `reallocateTo` args: `[r.vault, r.fee, r.withdrawals.map(w => ({ marketParams, amount })), targetMarketParams, false]`.
- `reallocationFee` is tracked in `action.args.reallocationFee`.

### `marketV1SupplyCollateralBorrow`

Atomic bundled: collateral transfer + `morphoSupplyCollateral` + `morphoBorrow`.

- GeneralAdapter1 must be authorized on Morpho (`setAuthorization`).
- `morphoBorrow` args: `[marketParams, borrowAmount, 0n (shares), minSharePrice, receiver, false]`.
- `onBehalf` for supply collateral = user. Borrow `onBehalf` = initiator (handled by adapter).
- Supports `nativeAmount` wrapping for collateral.
- Zero loss: all collateral to Morpho, all borrowed tokens to receiver.

**With reallocations** (`reallocations?: VaultReallocation[]`):

Bundle action sequence:
```
1. (optional) nativeTransfer + wrapNative           ← if nativeAmount
2. (optional) erc20TransferFrom / permit actions     ← if ERC20 amount
3. morphoSupplyCollateral(marketParams, totalCollateral, onBehalf, [], false)
4. reallocateTo(vault, fee, withdrawals, targetMarketParams, false)  ← per VaultReallocation
   ...repeat for each reallocation...
5. morphoBorrow(marketParams, borrowAmount, 0n, minSharePrice, receiver, false)
```

- Reallocations are inserted **between** `morphoSupplyCollateral` and `morphoBorrow`.
- `tx.value = (nativeAmount ?? 0n) + reallocationFee` — combines native wrapping and reallocation fees.
- Same validation as `marketV1Borrow` via `validateReallocations()`.
- `reallocationFee` is tracked in `action.args.reallocationFee`.

## Common Pattern

1. **Validate** inputs (dedicated errors).
2. **Encode** calldata (`BundlerAction.encodeBundle` for bundler, `encodeFunctionData` for direct).
3. **Append metadata** if provided.
4. **Deep-freeze** and return `{ ...tx, action: { type, args } }`.
