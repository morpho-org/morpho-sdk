# Helpers Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Utility functions shared across layers.

## Intent

- `addTransactionMetadata(tx, metadata)` — concatenates hex-encoded origin + optional timestamp to `tx.data`.
- Origin: max 4 bytes hex identifier for analytics tracing.
- Timestamp: 4-byte unix timestamp prepended before origin.

## Key Constraint

Pure function. Returns a new tx object — never mutates the input.
