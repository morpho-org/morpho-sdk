# AGENTS.md

> Instructions for AI agents working on this repository.
> For full project conventions, see [CONVENTIONS.md](./CONVENTIONS.md).

## Quick Setup

```bash
pnpm install
pnpm build          # Type-check + compile
pnpm test           # Run tests (requires MAINNET_RPC_URL in .env)
pnpm lint           # Biome linter
```

## Architecture Summary

```
MorphoClient → MorphoVaultV2 (entity) → Action functions (pure)
                                           └── Requirements (approval/permit/permit2)
```

- **Client** (`src/client/`): Wraps viem Client, provides vault access.
- **Entities** (`src/entities/`): VaultV2 entity with deposit/withdraw/redeem methods.
- **Actions** (`src/actions/`): Pure functions building transaction objects.
- **Types** (`src/types/`): All type definitions, custom errors.

## Critical Rules

1. **Read `CONVENTIONS.md`** before making any changes - it contains all project patterns and conventions.
2. **Strict TypeScript**: Never use `any`. All strict flags are enabled.
3. **Immutability**: All transaction objects must be deep-frozen via `deepFreeze`.
4. **Action pattern**: New actions must extend `BaseAction<TType, TArgs>` and return `Transaction<TAction>`.
5. **Error handling**: Use custom error classes from `src/types/error.ts`.
6. **Formatting**: Biome enforces double quotes, 2-space indentation, no unused imports/variables.
7. **Security**: Never bypass the bundler/general adapter for deposits (inflation attack protection).
8. **Barrel exports**: All public API is re-exported through `index.ts` files.
9. **Run validation**: After changes, run `pnpm lint` and `pnpm build`.
10. **Do not modify tests** without understanding what they validate and why.
