# Consumer SDK

> Full conventions and architecture: [CLAUDE.md](CLAUDE.md)

Morpho Consumer SDK — builds transactions for VaultV1 (MetaMorpho) and VaultV2 operations.

## Layer Intents

Each layer has its own `AGENTS.md` with scoped context:

| Layer | File | Role |
|-------|------|------|
| Client | [`src/client/AGENTS.md`](src/client/AGENTS.md) | Wraps viem Client, manages options, factory for entities |
| Entity | [`src/entities/AGENTS.md`](src/entities/AGENTS.md) | Fetches on-chain data, delegates to actions |
| Actions | [`src/actions/AGENTS.md`](src/actions/AGENTS.md) | Pure tx builders (vault ops + approval resolution) |
| Types | [`src/types/AGENTS.md`](src/types/AGENTS.md) | All type definitions, custom errors |
| Helpers | [`src/helpers/AGENTS.md`](src/helpers/AGENTS.md) | Metadata utilities |

## Non-Negotiables

- `pnpm lint && pnpm build` after every change.
- Never bypass the general adapter for deposits.
- All returned `Transaction` objects must be `deepFreeze`-d.
- Zero `any`. Strict TypeScript.
