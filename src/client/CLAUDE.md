# Client Layer

> Full context: [CLAUDE.md](../../CLAUDE.md)

Entry point of the SDK. `MorphoClient` wraps a viem `Client` and exposes vault accessors.

## Intent

- Manages SDK options: `supportSignature`, `supportDeployless`, `metadata`.
- Factory for entities: `client.vaultV2(address, chainId)` → `MorphoVaultV2`.
- Never holds state beyond configuration. Never calls actions directly.

## Key Constraint

All options are `readonly`. Do not add mutable state here.
