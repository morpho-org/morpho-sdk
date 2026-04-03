# MarketV1 (Morpho Blue) Entity

> Parent: [`src/entities/CLAUDE.md`](../CLAUDE.md)

`MorphoMarketV1` implements `MarketV1Actions`. Client -> Actions for Morpho Blue markets.

## Constructor

`MorphoMarketV1(client, marketParams: MarketParams, chainId)`.

## Methods

### `getMarketData` / `getPositionData`

Fetch on-chain state via `fetchMarket` / `fetchAccrualPosition`.
`AccrualPosition` provides health metrics: `maxBorrowAssets`, `ltv`, `isHealthy`, `borrowAssets`, `collateral`.

### `supplyCollateral`

Always routed through bundler3 via GeneralAdapter1. Requirements = approve GeneralAdapter1 (uses `getRequirements` orchestrator).
When `nativeAmount` is provided, native token is wrapped via `nativeTransfer` + `wrapNative`.

### `borrow`

Routed through bundler3 via `morphoBorrow`. Requires GeneralAdapter1 authorization on Morpho (`setAuthorization`).
Uses `minSharePrice` (computed from market borrow state + slippage tolerance) for slippage protection.

### `supplyCollateralBorrow`

Always bundler. Validates:

1. Input amounts (positive, non-zero collateral).
2. LLTV buffer: `totalBorrowAfter <= maxSafeBorrow` where `maxSafeBorrow = collateralValue * (LLTV - buffer)`.
   - `ORACLE_PRICE_SCALE = 1e36`. Buffer default = 0.5%, max = 10%.
   - Throws `BorrowExceedsSafeLtvError` with the max safe additional borrow amount.
   - Throws `MissingMarketPriceError` if oracle price unavailable.
3. Native wrapping: collateral token must be wNative.

`getRequirements` returns:

- ERC20 approval for GeneralAdapter1 (collateral token).
- `morpho.setAuthorization(generalAdapter1, true)` tx if not yet authorized (reads via `publicActions`).

### `repay`

Routed through bundler3 via GeneralAdapter1. Two modes via `RepayAmountArgs`:
- **By assets** (`{ amount }`): partial repay by exact asset amount.
- **By shares** (`{ shares }`): full repay by exact share count (immune to interest accrual between tx construction and execution).

Validates: amount/shares > 0, slippage tolerance, `validateRepayAmount`/`validateRepayShares`.
Computes `maxSharePrice` via `computeMaxRepaySharePrice` (upper-bound slippage protection).
In shares mode, `transferAmount = market.toBorrowAssets(shares, "Up")` (upper-bound for ERC20 pull).

`getRequirements` returns loan token approval for GeneralAdapter1.
Does NOT require Morpho authorization (guard-rail: repay doesn't need it).

### `withdrawCollateral`

Routed through bundler3 via `morphoWithdrawCollateral`.
Validates position health after withdrawal via `validatePositionHealthAfterWithdraw` (LLTV buffer).

`getRequirements` returns `morpho.setAuthorization(generalAdapter1, true)` if not yet authorized.
No ERC20 approval needed (collateral flows out, not in).

### `repayWithdrawCollateral`

Atomic repay + withdraw. Validates combined health: simulates repay via `accrualPosition.repay(assets, shares)`, then checks withdrawal safety on the resulting position.

`getRequirements` returns both loan token approval and Morpho authorization.

## Key Constraints

- Validate `chainId` match before any on-chain call.
- Never encode calldata here — that belongs in Actions.
- All operations (`supplyCollateral`, `borrow`, `supplyCollateralBorrow`, `repay`, `withdrawCollateral`, `repayWithdrawCollateral`) are routed through bundler3 via GeneralAdapter1.
