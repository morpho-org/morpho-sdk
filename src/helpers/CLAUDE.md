# Helpers Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Utility functions shared across layers.

## Intent

- `addTransactionMetadata(tx, metadata)` — concatenates hex-encoded origin + optional timestamp to `tx.data`.
- Origin: max 4 bytes hex identifier for analytics tracing.
- Timestamp: 4-byte unix timestamp prepended before origin.

- `encodeForceDeallocateCall(deallocation, onBehalf)` — ABI-encodes a single `VaultV2.forceDeallocate` calldata entry.
- `Deallocation` interface: `{ adapter, assets, marketParams? }`. When `marketParams` is present, `data` is ABI-encoded `MarketParams` (Morpho Market V1 adapter); when omitted, empty bytes are used (e.g. Vault V1 adapters).

- `constant.ts` — shared constants:
  - `MAX_SLIPPAGE_TOLERANCE` = 10% (WAD/10). For vault deposit share price.
  - `DEFAULT_LLTV_BUFFER` = 0.5% (WAD/200). Safety margin below LLTV for `supplyCollateralBorrow`.
  - `MAX_LLTV_BUFFER` = 10% (WAD/10). Upper bound for LLTV buffer.

## Key Constraints

- Pure functions. Return new objects — never mutate inputs.
- `encodeDeallocateData` is internal; only `encodeForceDeallocateCall`.
