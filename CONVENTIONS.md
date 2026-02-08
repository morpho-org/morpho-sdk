# Consumer SDK - Project Conventions

> Single source of truth for all AI agents and contributors working on this codebase.

## Project Overview

`@morpho-org/consumer-sdk` is a TypeScript SDK that provides an abstraction layer over the Morpho Protocol. It simplifies building transactions for **VaultV2** operations (deposit, withdraw, redeem) on EVM-compatible chains.

- **Repository**: `morpho-org/consumer-sdk`
- **License**: MIT

## Tech Stack

| Tool         | Version / Info             |
| ------------ | -------------------------- |
| Language     | TypeScript (strict mode)   |
| Runtime      | Node.js 24                 |
| Package Mgr  | pnpm 10.x                  |
| Linter       | Biome 2.x                  |
| Test Runner  | Vitest 3.x                 |
| Ethereum Lib | viem 2.x (peer dependency) |
| Validation   | zod 4.x                    |
| Versioning   | Changesets                 |

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Type-check (noEmit) then compile to lib/
pnpm test             # Run tests with Vitest
pnpm test:coverage    # Run tests with coverage
pnpm lint             # Run Biome linter (biome check)
pnpm changeset        # Create a changeset for versioning
```

## Architecture

```
src/
├── index.ts              # Re-exports all public API
├── client/               # High-level client layer
│   ├── morphoClient.ts   # MorphoClient class (main entry point)
│   └── morphoViemExtension.ts  # Viem client extension (adds .morpho namespace)
├── entities/             # Domain entities
│   └── vaultV2/          # VaultV2 entity implementing VaultV2Actions
├── actions/              # Transaction builders (pure functions)
│   ├── vaultV2/          # Vault operations (deposit, withdraw, redeem)
│   └── requirements/     # Approval/permit requirement system
│       └── encode/       # Encoding helpers for approvals and permits
├── helpers/              # Utility functions (metadata handling)
└── types/                # All TypeScript type definitions
    ├── action.ts         # BaseAction, Transaction, Requirement types
    ├── client.ts         # MorphoClientType interface
    ├── entity.ts         # VaultParams
    ├── error.ts          # Custom error classes
    └── metadata.ts       # Metadata type
```

### Layered Architecture

```
MorphoClient (high-level)
    └── MorphoVaultV2 (entity, implements VaultV2Actions)
            ├── deposit()  → vaultV2Deposit()  (uses bundler3)
                └── getRequirements() (approval/permit/permit2)
            ├── withdraw() → vaultV2Withdraw() (direct vault call)
            └── redeem()   → vaultV2Redeem()   (direct vault call)

```

- **Client layer** wraps a viem `Client` and provides access to vault entities.
- **Entity layer** (`MorphoVaultV2`) fetches on-chain data and delegates to action builders.
- **Action layer** contains pure functions that construct transaction objects.

### Two Usage Modes

1. **Via MorphoClient** (recommended): High-level, manages vault instances and options.
2. **Direct construction**: Call action functions like `vaultV2Deposit()` directly for advanced use.

## Code Conventions

### Formatting (Biome)

- **Indentation**: 2 spaces
- **Quotes**: Double quotes (`"`)
- **Semicolons**: Yes (default Biome behavior)
- **Unused imports**: Error (auto-removed by Biome)
- **Unused variables**: Error
- **Import organization**: Automatic via Biome assist

### TypeScript

- **Strict mode** enabled with all strict flags (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitThis`, `noUncheckedIndexedAccess`)
- **Module system**: ESNext with NodeNext resolution
- **Target**: ESNext
- Use `readonly` properties for immutable data (especially in interfaces and class fields)
- Use `type` imports for type-only imports (`import type { ... }`)
- Use `interface` for object shapes, `type` for unions and intersections

### Design Patterns

1. **Discriminated unions** for action types: `BaseAction<TType, TArgs>` with `type` as the discriminant.
2. **Deep freeze** on all returned transaction objects for immutability (`deepFreeze` from `@morpho-org/morpho-ts`).
3. **Custom error classes** for each specific error case (see `src/types/error.ts`).
4. **Viem extension pattern** for seamless integration with viem clients.
5. **Builder pattern** for transactions: actions return `{ buildTx, getRequirements }`.

### Key Type Patterns

```typescript
// All actions extend BaseAction with a discriminant type string
interface BaseAction<
  TType extends string,
  TArgs extends Record<string, unknown>
> {
  readonly type: TType;
  readonly args: TArgs;
}

// Transactions wrap an action with to/value/data
interface Transaction<TAction extends BaseAction> {
  readonly to: Address;
  readonly value: bigint;
  readonly data: Hex;
  readonly action: TAction;
}

// Requirements can be either a Transaction (approval) or a Requirement (signature)
interface Requirement {
  sign: (client: Client, userAddress: Address) => Promise<RequirementSignature>;
  action: PermitAction | Permit2Action;
}
```

### Error Handling

- Throw specific custom errors rather than generic `Error` instances.
- Custom errors are defined in `src/types/error.ts`.
- Validate inputs at the start of action functions (e.g., zero amount checks).

### Testing

- Tests live alongside source files (`*.test.ts`) or in the `test/` directory.
- Use Vitest with concurrent mode enabled.
- Test timeout: 30 seconds.
- Tests require a `.env` file with `MAINNET_RPC_URL` for forked mainnet testing.

## Security Considerations

- **Never bypass the general adapter** for deposits: it enforces `maxSharePrice` to prevent inflation attacks.
- **Always validate chain IDs** before building transactions.
- **Transaction immutability**: All returned transaction objects are deep-frozen.
- **Permit signature handling**: Signatures are validated and never stored.

## Rules for AI Agents

1. **Read before editing**: Always read and understand existing code before modifying it.
2. **Follow existing patterns**: New actions should follow the `BaseAction` + `Transaction` pattern.
3. **Type safety first**: Never use `any`. Leverage the strict TypeScript configuration.
4. **Run checks**: After changes, run `pnpm lint` and `pnpm build` to verify.
5. **Do not modify tests** without understanding what they validate.
6. **Preserve immutability**: Always `deepFreeze` transaction return values.
7. **Custom errors**: Create specific error classes for new error cases.
8. **Keep the architecture**: Client -> Entity -> Action layering must be preserved.
9. **Barrel exports**: All public API must be re-exported through `index.ts` files.
10. **JSDoc comments**: All public functions and interfaces must have JSDoc documentation.
