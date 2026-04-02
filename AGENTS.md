# Consumer SDK

> Full conventions and architecture: [CLAUDE.md](CLAUDE.md)

Morpho Consumer SDK — builds transactions for VaultV1 (MetaMorpho), VaultV2, and MarketV1 (Morpho Blue) operations.

## Layer Intents

Each layer has its own `AGENTS.md` with scoped context:

| Layer   | File                                               | Role                                                           |
| ------- | -------------------------------------------------- | -------------------------------------------------------------- |
| Client  | [`src/client/AGENTS.md`](src/client/AGENTS.md)     | Wraps viem Client, manages options, factory for entities       |
| Entity  | [`src/entities/AGENTS.md`](src/entities/AGENTS.md) | Fetches on-chain data, delegates to actions                    |
| Actions | [`src/actions/AGENTS.md`](src/actions/AGENTS.md)   | Pure tx builders (vault ops, market ops + approval resolution) |
| Types   | [`src/types/AGENTS.md`](src/types/AGENTS.md)       | All type definitions, custom errors                            |
| Helpers | [`src/helpers/AGENTS.md`](src/helpers/AGENTS.md)   | Metadata utilities, constants                                  |

## Shared Liquidity & Reallocations

`borrow` and `supplyCollateralBorrow` accept an optional `reallocations: VaultReallocation[]`. Each reallocation triggers a `PublicAllocator.reallocateTo()` call in the bundler bundle, moving liquidity from source markets to the target market before the borrow executes. Fees (native token) accumulate in `tx.value`. Types: `VaultReallocation`, `ReallocationWithdrawal` (`src/types/sharedLiquidity.ts`).

## Non-Negotiables

- `pnpm lint && pnpm build` after every change.
- Never bypass the general adapter for deposits.
- All returned `Transaction` objects must be `deepFreeze`-d.
- Zero `any`. Strict TypeScript.
