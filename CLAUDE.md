# CLAUDE.md

> Instructions for Claude Code and Codex working on this repository.
> Read [CONVENTIONS.md](./CONVENTIONS.md) for full project knowledge.

## Essential Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Type-check (noEmit) then compile to lib/
pnpm test             # Run tests (needs MAINNET_RPC_URL in .env)
pnpm lint             # Biome linter check
```

Always run `pnpm lint` and `pnpm build` after making changes. Fix any errors before considering work complete.

## Architecture

```
src/client/     → MorphoClient (wraps viem Client)
src/entities/   → MorphoVaultV2 (implements VaultV2Actions: deposit, withdraw, redeem)
src/actions/    → Pure transaction builders (vaultV2Deposit, vaultV2Withdraw, vaultV2Redeem)
src/actions/requirements/ → Approval/permit requirement resolution
src/types/      → All type definitions, custom errors, interfaces
src/helpers/    → Utility functions (metadata)
```

## Key Patterns

- All actions extend `BaseAction<TType, TArgs>` with a string discriminant `type` field.
- Transactions are `{ to, value, data, action }` and always deep-frozen (immutable).
- Requirements can be `Transaction<ERC20ApprovalAction>` (classic approval) or `Requirement` (signature-based permit/permit2).
- Deposit uses the bundler for atomic execution; withdraw and redeem are direct vault calls.
- Custom error classes in `src/types/error.ts` for each failure case.

## Code Style

- TypeScript strict mode (all flags enabled)
- Double quotes, 2-space indentation (Biome)
- No unused imports or variables (Biome error)
- Use `readonly` on interface/class properties
- Use `type` imports for type-only imports
- JSDoc on all public functions and interfaces

## Rules

1. Read existing code before modifying - understand the pattern first.
2. Never use `any` - this project uses strict TypeScript.
3. Always `deepFreeze` transaction return values.
4. Never bypass the general adapter for deposits (security: inflation attack prevention).
5. New error cases require dedicated custom error classes.
6. All public API must be re-exported via barrel `index.ts` files.
7. Follow the Client -> Entity -> Action layered architecture.
8. Do not commit without explicit user request.
