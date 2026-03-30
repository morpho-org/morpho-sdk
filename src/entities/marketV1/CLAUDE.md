# MarketV1 (Morpho Blue) Entity

> Parent: [`src/entities/CLAUDE.md`](../CLAUDE.md)

`MorphoMarketV1` implements `MarketV1Actions`. Client -> Actions for Morpho Blue markets.

## Constructor

`MorphoMarketV1(client, marketparams: MarketParams, chainId)`.

## Methods

### `getMarketData` / `getPositionData`

Fetch on-chain state via `fetchMarket` / `fetchAccrualPosition`.
`AccrualPosition` provides health metrics: `maxBorrowAssets`, `ltv`, `isHealthy`, `borrowAssets`, `collateral`.

### `supplyCollateral`

Dual-path based on `nativeAmount`:

- **No native**: direct `morpho.supplyCollateral()`. Requirements = approve Morpho (reads allowance via `publicActions`).
- **Native**: bundler path. Requirements = approve GeneralAdapter1 (uses `getRequirements` orchestrator).

### `borrow`

Direct `morpho.borrow()`. No bundler, no requirements.

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

## Key Constraints

- Validate `chainId` match before any on-chain call.
- Never encode calldata here — that belongs in Actions.
- `supplyCollateral` (solo, no native) and `borrow` (solo) are direct Morpho calls. `supplyCollateralBorrow` always uses bundler.
