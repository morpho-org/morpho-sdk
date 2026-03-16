# Consumer SDK

Morpho Consumer SDK — TypeScript SDK that provides an abstraction layer over the Morpho Protocol.
It simplifies building transactions for **VaultV1** (MetaMorpho) and **VaultV2** operations on EVM-compatible chains.

## Intent Layer

This repo uses a layered documentation approach. Before working in any directory:

- `AGENTS.md` mirrors this file for non-Claude agents.
- After significant changes, update `CONVENTIONS.md` if patterns or pitfalls changed.

## Non-Negotiables

- **Validate before done.** After every change: `pnpm lint && pnpm build`. Fix errors before stopping.
- **Never bypass the general adapter for deposits.** It enforces `maxSharePrice` — inflation attack vector otherwise.
- Always validate `chainId` match before any on-chain call between client and params.
- **Immutability.** Every returned `Transaction` object must be `deepFreeze`-d. No exceptions.
- **Strict TypeScript.** Zero `any`. All strict flags enabled. Use `type` imports, `readonly` properties.
- **Do not commit** without explicit user request.
- **Do not modify tests** without understanding what they validate and why.

## Architecture

Strict layering: **Client → Entity → Action**. Never skip a layer.

| Layer        | Location                    | Role                                                                |
| ------------ | --------------------------- | ------------------------------------------------------------------- |
| Client       | `src/client/`               | Wraps viem `Client`, manages options, provides vault access         |
| Entity       | `src/entities/vaultV1/`     | VaultV1 (MetaMorpho): fetches on-chain data, delegates to actions   |
| Entity       | `src/entities/vaultV2/`     | VaultV2: fetches on-chain data, delegates to actions                |
| Actions      | `src/actions/vaultV1/`      | VaultV1 pure tx builders (deposit, withdraw, redeem)                |
| Actions      | `src/actions/vaultV2/`      | VaultV2 pure tx builders (deposit, withdraw, redeem, force ops)     |
| Requirements | `src/actions/requirements/` | Resolves approval / permit / permit2 needs                          |
| Types        | `src/types/`                | All type definitions, custom errors. Barrel-exported via `index.ts` |
| Helpers      | `src/helpers/`              | Utility functions (metadata handling)                               |

VaultV1 (MetaMorpho) operations:

- **deposit** → `vaultV1Deposit()` — routed through bundler3 (never bypass general adapter)
- **withdraw** → `vaultV1Withdraw()` — direct vault call
- **redeem** → `vaultV1Redeem()` — direct vault call

VaultV2 operations:

- **deposit** → `vaultV2Deposit()` — routed through bundler3 (never bypass general adapter)
- **withdraw** → `vaultV2Withdraw()` — direct vault call
- **redeem** → `vaultV2Redeem()` — direct vault call
- **forceWithdraw** → `vaultV2ForceWithdraw()` — bundled via multicall on VaultV2 contract (N forceDeallocate + 1 withdraw)
- **forceRedeem** → `vaultV2ForceRedeem()` — bundled via multicall on VaultV2 contract (N forceDeallocate + 1 redeem)

## Code Standards

- Biome: double quotes, 2-space indent, no unused imports/variables
- All actions extend `BaseAction<TType, TArgs>` — discriminated union on `type`
- New error cases require a dedicated class in `src/types/error.ts`
- All public API re-exported through barrel `index.ts` files
- JSDoc on every exported function and interface
- Read existing code before modifying — follow neighboring patterns
