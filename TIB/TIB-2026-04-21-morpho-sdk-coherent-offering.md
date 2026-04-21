# TIB-2026-04-21: Morpho SDK — A Coherent, Principle-Driven SDK Offering

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| **Status**        | Proposed                                                |
| **Date**          | 2026-04-21                                              |
| **Author**        | @0xbulma                                                |
| **Scope**         | Repo-wide — `consumer-sdk` → `morpho-org/sdks` monorepo |

---

## Context

Morpho's TypeScript surface today is fragmented across 10+ published packages (`blue-sdk`, `blue-sdk-viem`, `bundler-sdk-viem`, `simulation-sdk`, `morpho-ts`, plus wagmi helpers and specialized consumers). Integrators routinely report the same friction: *too many packages, unclear entry point, no single place to file issues*. At the same time, `@morpho-org/consumer-sdk` has matured into a clean, layered, pure-I/O transaction builder — but it lives in its own private repo and is not the canonical surface integrators reach for.

Two forcing functions align now:

1. **Tether WDK launch** (target 2026-04-27) is blocked on `consumer-sdk` being public. Cantina security scan is in flight.
2. **Aseem's *DevEx Product Plan*** (Apr 10 2026) commits Morpho to converging on a single SDK — `@morpho-org/morpho-sdk` — as the one place business logic lives. Every other surface (MCP server, write API, partner apps, Morpho's own products) becomes a thin wrapper.

This TIB does not invent the SDK. It **codifies** the principles and architectural decisions that make the Product Plan's commitment durable — so the SDK stays coherent as it grows, and so integrators, contributors, and future agents all share the same mental model.

## Goals / Non-Goals

**Goals**

- Establish `@morpho-org/morpho-sdk` as the one integrator-facing TypeScript SDK for Morpho.
- Codify non-negotiable principles — purity, statelessness, layering, immutability, typed errors, zero framework coupling — as the contract every future change is measured against.
- Define an architecture that makes the SDK trivially auditable and easy to reason about for audit-constrained partners (Privi, Bitwise, Tether).
- Commit to a clear versioning & deprecation contract the integration team can rely on.
- Consolidate into the existing `morpho-org/sdks` monorepo so internal deps become `workspace:*` and the release story is unified.

**Non-Goals**

- Indexer-backed reads (`morpho.api.*`) — deferred to a later TIB.
- Simulation, historical/analytics queries, real-time data (webhooks) — deferred.
- Framework helpers (React hooks, wagmi adapters) — explicitly out of core.
- Deprecating Bundler3 or `@morpho-org/bundler-sdk-viem` — protocol decision, not this TIB's concern.
- New protocol features, Markets V2 design, or any on-chain change.
- Migrating Morpho's own apps onto the SDK (tracked in Product Plan Phase 1 exit criteria, not here).

## Current Solution

- `@morpho-org/consumer-sdk` v0.6.0 — **private**, single-package, ready to open-source. Already embodies most of the principles below (layered Client → Entity → Action, pure transaction builders, immutable outputs, strict TS, zero `any`). Covers VaultV1 (MetaMorpho), VaultV2, and MarketV1 write operations.
- `morpho-org/sdks` — public monorepo with 10+ `@morpho-org/*` packages. No Changesets. Several packages have drifted (simulation-sdk, wagmi helpers) and are marked for deprecation in the Product Plan.
- Without action: Tether WDK slips, integrators keep forking custom wrappers, the SDK story stays incoherent, and the principles that make `consumer-sdk` good dilute as it grows.

## Proposed Solution

A **principle-driven, single-package SDK** — `@morpho-org/morpho-sdk` — living in the existing `morpho-org/sdks` monorepo. The principles, architecture, and contracts below are the load-bearing content. Migration and release mechanics follow.

### Vision

**A TypeScript SDK that does one thing perfectly: build ready-to-send Morpho transactions.**

No execution. No gas estimation. No signing. No wallet connection. No caching. No framework coupling. No hidden state. No surprises.

The SDK is a **pure, deterministic calldata factory**. Given the same inputs and the same on-chain state, it returns the same `Transaction`, byte-for-byte. Everything else — wallets, tx sending, UI, simulation, analytics — is the integrator's domain.

Audit-constrained partners need to inspect exactly what they ship. A small, deterministic, stateless SDK is easy to audit, easy to pin, easy to trust. An SDK that secretly fetches, caches, or mutates is none of those things.

> *"Pure functions that return ready-to-send Morpho transactions. No simulation engines, no hidden state, no framework lock-in — just calldata you can trust."*

### Core Principles (non-negotiable)

The through-lines of the SDK. If a change violates one, the change doesn't land.

1. **Pure I/O.** Actions are `(args: Args) => Transaction<TType>`. No side effects, no network, no clock, no randomness. Actions are not `async`. Network I/O exists in exactly one layer — entity fetchers — and is always named, typed, and documented.
2. **Strictly stateless.** `MorphoClient` wraps a `viem.Client` + options. It does not cache on-chain data, not even opportunistically. No `init()`, no warm-up. The SDK has no lifecycle. Integrators either pass state in or re-fetch.
3. **Layered, one-way.** `Client → Entity → Action`. Calls flow strictly downward. Actions never call entities; entities never construct clients. Enforced by a forbidden-import lint rule at folder boundaries.
4. **Immutable outputs.** Every returned `Transaction` is `deepFreeze`-d. No in-flight mutation. No ambiguity about what will be sent.
5. **Strict TypeScript, zero `any`.** All `strict` flags on. Discriminated unions for action types. `readonly` on every public property. Exhaustive `switch` enforced at the type level. If something is hard to type, the API is wrong — fix the API.
6. **Typed errors as public API.** No `throw new Error(...)`. Every failure mode is a named, exported class. Integrators pattern-match on classes, not strings.
7. **Protocol-faithful API.** Where protocols overlap (e.g. ERC-4626 deposits across VaultV1 and VaultV2), the SDK offers a consistent shape. Where they genuinely differ — force-deallocation, market lending, future bundlers, chain-specific handlers — we expose the difference honestly. No forced sameness, no manufactured complexity.
8. **No framework coupling.** No wagmi, React, ethers, Redux, or RxJS. `viem` is the only peer dep. Framework helpers, if ever needed, are separate opt-in packages — never a runtime dep of core. CI enforces with a forbidden-import rule.
9. **RPC-only in v1.0.** Zero dependency on Morpho-operated infrastructure. Any RPC + viem is sufficient for the full public surface. When indexer-backed reads land later, opting out keeps this principle true.
10. **Security invariants codified as tests.** Prose in docs is a guide, not a guarantee. Every security invariant (inflation-attack defense, LLTV buffer, `chainId` validation) is asserted by a test that would fail if removed.

### Architecture

#### Three layers, one direction

```
┌─────────────────────────────────────────────────┐
│                Integrator code                  │
└───────────────────┬─────────────────────────────┘
                    │ createMorphoClient({ viemClient })
                    ▼
          ┌────────────────────┐
          │    MorphoClient    │    wraps viem Client + options
          │     (stateless)    │
          └─┬────────┬───┬─────┘
.vaultV1() / .vaultV2() / .marketV1()
            │        │   │
            ▼        ▼   ▼
       ┌────────────────────┐
       │     Entities       │    fetch on-chain state, compute
       │ VaultV1/V2/MarketV1│    derived values, delegate
       └──────────┬─────────┘
                  │
                  ▼
       ┌────────────────────┐
       │      Actions       │    pure: (args) => Transaction
       │  (no state, no I/O)│    deepFreeze on exit
       └────────────────────┘
```

Each layer has one job:

| Layer      | Job                                                                                                  | Forbidden                                     |
| ---------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Client** | Wrap viem client, hold options, mint entities                                                        | Call actions directly; hold mutable state     |
| **Entity** | Fetch on-chain data, compute derived values (`maxSharePrice`, LLTV buffer), delegate to actions      | Encode calldata; know bundler internals      |
| **Action** | Validate inputs, encode calldata, `deepFreeze`, return `Transaction`                                 | Fetch data; hold state; mutate inputs        |

#### Boundaries the SDK defends

- **Never touches a wallet.** The integrator owns `sendTransaction`, `signTypedData`, `signMessage`.
- **Never estimates gas.** `Transaction` has `to`, `data`, `value` — no `gas` field.
- **Never broadcasts.** Returning a `Transaction` ends our responsibility.
- **Never silently retries.** Failed on-chain reads throw; retry policy is the integrator's.
- **Never fetches ABIs at runtime.** ABIs ship in the package, frozen.

### How `morpho-sdk` fits into the `@morpho-org/*` ecosystem

`morpho-sdk` is the **only package integrators install**. Every other Morpho TS package is internal composition.

```
┌────────────────┐
│  Integrator    │   package.json:
│                │     "@morpho-org/morpho-sdk": "^1.0.0"
│                │     "viem": "^2.48.0"       (peer)
└───────┬────────┘
        │
        ▼
┌─────────────────────────────────────────────────┐
│         @morpho-org/morpho-sdk                  │   ← public surface
│    client / entities / actions / types          │
└──┬─────────────────┬───────────────┬────────────┘
   │                 │               │
   ▼                 ▼               ▼
┌───────────────┐ ┌──────────────┐ ┌──────────────┐
│ blue-sdk-viem │ │ bundler-sdk- │ │  morpho-ts   │
│               │ │    viem      │ │              │
│ fetchers,     │ │ bundler3     │ │ deepFreeze,  │
│ ABIs, EIP-712 │ │ action       │ │ Time, format │
│ typed data    │ │ encoders     │ │ helpers      │
└──────┬────────┘ └──────┬───────┘ └──────────────┘
       └────────┬────────┘
                ▼
       ┌──────────────────────────────┐
       │        blue-sdk              │   pure domain model
       │  Market, Vault, Position,    │   (no I/O)
       │  MarketParams, MathLib,      │
       │  addresses, constants        │
       └──────────────────────────────┘
```

Internal packages:

| Package             | Role                                                                                                |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `blue-sdk`          | Pure domain model — entity types, `MarketParams`, `MathLib`, chain addresses, protocol constants   |
| `blue-sdk-viem`     | Viem layer: ABIs, fetchers (`fetchMarket`, `fetchVault`, `fetchAccrualPosition`), EIP-712 helpers   |
| `bundler-sdk-viem`  | Bundler3 action encoders + `BundlerAction.encodeBundle()`                                           |
| `morpho-ts`         | Cross-cutting utilities (`deepFreeze`, `Time`, `isDefined`) — no domain knowledge                   |
| `morpho-sdk` (this) | Composition layer — the integrator-facing surface                                                   |

Not depended on (and why):

| Package                                            | Status           | Why                                                                                     |
| -------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| `simulation-sdk`                                   | **Sunsetting**   | Today used only for 2 constants + 3 types. Inlined into `morpho-sdk`; package deprecated |
| `blue-api-sdk`                                     | Out of v1.0     | GraphQL consumer types — relevant only if `morpho.api.*` lands later                    |
| `liquidity-sdk-viem`                               | Orthogonal      | Specialized PublicAllocator query helpers; write-side reallocation lives in `morpho-sdk` |
| `liquidation-sdk-viem`                             | Orthogonal      | Liquidation-bot tooling; specialized consumer                                            |
| `blue-sdk-wagmi`, `simulation-sdk-wagmi`           | Deprecating      | Framework coupling — violates principle #8                                              |

Re-export policy: types an integrator needs at the call site pass through `morpho-sdk`'s root barrel; functions from internal packages do not. Types at risk of upstream churn are re-declared locally to keep `morpho-sdk`'s version story decoupled from internal-dep churn.

### DevEx Contract

What we commit to the integration team:

| Commitment                  | Concrete form                                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Stable public API           | SemVer. Breaking changes only on major. Deprecation window ≥ 1 minor with `@deprecated` JSDoc + CHANGELOG entry. |
| Zero-overhead install       | `morpho-sdk` + `viem`. No other `@morpho-org/*` deps surfaced on the happy path.                                |
| Typed errors as public API  | Every failure class exported; pattern-match, don't string-match.                                                |
| Predictable I/O             | Every function's JSDoc lists the exact on-chain reads it triggers.                                              |
| Same shape V1 ↔ V2 ↔ Market | Identical call signatures across protocol versions.                                                             |
| First-class docs            | TypeDoc + handwritten recipes. LLM-ready chunks. Public Allocator gets a dedicated guide.                       |
| Examples repo               | `morpho-sdk-examples` — one runnable file per operation, commented, with troubleshooting annotations.           |
| Migration guides            | Every major release ships a migration guide + codemods where mechanical.                                        |
| Fork-based test harness     | Integrators can run against a pinned block with an Alchemy key.                                                 |
| Pinned ABIs and addresses   | Ship in-package, not fetched at runtime.                                                                        |
| Dogfood                     | Morpho's own products migrate onto `morpho-sdk` before v1.0 stable.                                             |

### Versioning & Deprecation

#### SemVer

The public API is exactly what the root `src/index.ts` barrel exports — nothing else is contract.

- **Major** — breaking changes.
- **Minor** — additive: new operations, options, error classes, chain support.
- **Patch** — bug fixes that preserve behavior, docs, invisible internal refactors.

Breaking includes: removing/renaming an export, adding required fields to an exported type, changing a function signature, changing thrown errors callers depend on, changing runtime behavior integrators rely on, bumping the `viem` peer-dep minimum, or adding a security invariant that rejects previously-allowed input (yes — even when correct).

Not breaking: internal refactors, new optional fields, new overloads, bug fixes that align behavior with documented contract, internal `@morpho-org/*` workspace-dep bumps that don't change `morpho-sdk`'s surface.

#### Deprecation — the 4 steps

```
1. Mark      @deprecated in JSDoc with replacement pointer and removal target.
2. Announce  CHANGELOG entry on the minor release introducing the deprecation.
3. Live      ≥ 1 full minor version with both old and new APIs working.
4. Remove    in the next major (not before).
```

```ts
/** @deprecated since 1.3.0 — use `vault.depositV2(...)` instead. Removed in 2.0. */
export function depositLegacy(args: LegacyArgs): Transaction { /* ... */ }
```

A minor release whose only purpose is adding deprecations ahead of a major is legitimate and expected.

#### Release mechanism

Changesets-driven. Every user-visible change ships with a changeset (no changeset → CI fails). Patch releases are lightweight (1-maintainer review). Major releases require a release plan, integration team sign-off, and a migration guide. Pre-release channels use `rc.N` / `beta.N` / `alpha.N` via npm dist-tags and never publish to `latest`.

#### Package rename (`consumer-sdk` → `morpho-sdk`)

Outside normal SemVer. Final `@morpho-org/consumer-sdk` release re-exports `morpho-sdk@1.0.0` with `@deprecated` notice and a `console.warn`. Supported for 1 minor of `morpho-sdk` (~1 month), then a tombstone release.

#### Chain support version policy

Adding a Tier-1 chain → minor. Tier-2 → Tier-1 promotion → minor. Removing chain support → major. Address change on an existing chain → minor, prominently called out in CHANGELOG (integrators may pin addresses for audit).

### Coding conventions (summary)

Concrete shapes — detail lives in `CONVENTIONS.md` and per-directory `AGENTS.md`.

- **Discriminated union** for actions: `BaseAction<TType, TArgs>` with `readonly type` + `readonly args`.
- **`Transaction<TAction>`** — exactly four fields: `to`, `data`, `value`, `action`. Always deep-frozen.
- **Typed error classes** — `name` field matching class, constructors taking facts not pre-built messages.
- **`{ getRequirements, buildTx }`** pair — the canonical shape for operations needing approvals.
- **`chainId` validation** at every public entry point. Throws `InvalidChainIdError`.
- **Barrels** per directory; root `src/index.ts` is the single public contract.
- **JSDoc is not optional** — every exported symbol has JSDoc covering what it does, what it reads on-chain, what it throws, and an example.
- **Tests mirror source** — `test/actions/vaultV1/deposit.test.ts` ↔ `src/actions/vaultV1/deposit.ts`.

Anti-patterns rejected in review: `any`, `throw new Error(...)`, `async` actions, fetching inside actions, mutating arguments, module-level state, imports from wagmi/ethers/react.

### Implementation Phases

- **Phase 0 — Open-source (pre-migration):** `consumer-sdk` repo flipped public after Cantina scan (target 2026-04-27). Enables Tether WDK immediately; buys time to land the monorepo migration without blocking partners.
- **Phase 1 — Consolidate into `morpho-org/sdks` and cut v1.0:**
  - Drop sources into `packages/morpho-sdk/`. Preserve history via `git subtree`.
  - Convert 5 Morpho deps to `workspace:^`. Remove `@morpho-org/simulation-sdk` (inline constants + local types).
  - Align tooling (Biome, tsconfig, Vitest, anvil fixtures from `@morpho-org/test`) with monorepo root.
  - Introduce Changesets at monorepo root (load-bearing for v1.0 release mechanics).
  - Add to CI matrix; wire `MAINNET_RPC_URL` at destination.
  - Rename `consumer-sdk` → `morpho-sdk`, cut `1.0.0-rc.0`, dogfood with Tether WDK, then cut `1.0.0` stable.
  - Tombstone `@morpho-org/consumer-sdk` with a final re-export release.
- **Phase 2+ — Reads, simulation, indexer integration (future TIB):** `morpho.api.*` namespace, pure simulation, historical/analytics. Designed so the RPC-only principle holds for callers that opt out. Covered by a separate TIB.

## Considered Alternatives

### Alternative 1: Keep fragmented packages, rename `consumer-sdk` only

Open-source `consumer-sdk` under its own repo as-is, don't migrate into `morpho-org/sdks`, leave integrators to install several `@morpho-org/*` packages.

**Why rejected:** Preserves every integrator complaint we heard (too many packages, unclear entry point, no unified CHANGELOG). Misses the forcing function — the Product Plan explicitly commits to SDK convergence. Near-term speed gain, long-term incoherence.

### Alternative 2: Two packages — `morpho-sdk-core` + `morpho-sdk`

Hard package split where `morpho-sdk-core` is RPC-only (for audit-constrained partners) and `morpho-sdk` adds indexer-backed reads on top.

**Why rejected:** The audit-constrained concern is real, but a namespace boundary (`onchain.*` vs future `api.*`) is sufficient — partners inspect the code they ship regardless of package boundary. A split doubles our release surface for zero partner-visible benefit. Revisit if a specific partner audit explicitly requires package-level isolation.

### Alternative 3: Stateful client with on-chain cache

`MorphoClient` holds snapshots of market/vault state, reused across calls to reduce RPC load.

**Why rejected:** Directly contradicts the "no opaque payload" posture that audit-constrained partners require. Creates cache-invalidation footguns. Makes the SDK impossible to reason about under concurrent on-chain changes. Caching is the integrator's concern, not ours.

### Alternative 4: Include indexer-backed reads and simulation in v1.0

Ship `morpho.api.*` and simulation now, inside the v1.0 cut.

**Why rejected:** Expands scope, delays Tether WDK, introduces Morpho-infra runtime dependency into the core SDK. Deferring keeps v1.0 achievable by 2026-05-23 and preserves principle #9. Indexer and simulation land in a later TIB without contradicting v1.0's shape.

### Alternative 5: Thin wrapper / meta-package

Publish `morpho-sdk` as a meta-package that just re-exports from `blue-sdk` + `blue-sdk-viem` + `bundler-sdk-viem`.

**Why rejected:** Doesn't solve the "too many deps in lockfile" complaint (transitive deps are still visible). Doesn't give us a place to enforce layering, invariants, or the DevEx contract. Re-exports alone don't make an SDK coherent.

## Assumptions & Constraints

- Cantina security scan completes without critical findings by 2026-04-27 (Aseem driving).
- `morpho-org/sdks` monorepo accepts Changesets as its release mechanism (currently absent).
- The `@morpho-org/test` package can host or already hosts shared anvil fixtures (sibling packages `liquidation-sdk-viem`, `bundler-sdk-viem` use fork-based tests — check before migration).
- Tether WDK remains the near-term driving forcing function; delays in WDK do not weaken the case for consolidation.
- `viem` remains Morpho's chosen Ethereum client library. Migration off viem would require a new TIB.
- The Product Plan's sunset list (`simulation-sdk`, wagmi helpers) is settled direction; no stakeholder reverses it during v1.0 execution.
- V1 vault support stays in v1.0 (existing, works). No V1-specific new features after v1.0.

## Dependencies

- `viem@^2.48.1` — peer dep, pinned to tested minor.
- Internal workspace deps: `@morpho-org/blue-sdk`, `blue-sdk-viem`, `bundler-sdk-viem`, `morpho-ts` — consumed as `workspace:^` after migration.
- `@morpho-org/test` — dev-dep, fork test harness.
- `morpho-org/sdks` monorepo access for the migration PR.
- Cantina scan completion (Aseem) to unblock the public repo flip.
- Product Plan approval (Aseem's doc) — this TIB derives from it.

## Observability

- **Bundle size budget in CI.** Per-entry-point tree-shake assertion. Importing one action must not pull in unrelated code.
- **Forbidden-import lint rule.** CI fails on any import of `wagmi`, `@wagmi/*`, `ethers`, `react`.
- **Layered-import lint rule.** CI fails if an action imports from entities, or entities import from client.
- **Fork test suite** in CI with `MAINNET_RPC_URL`, pinned block, per-chain matrix.
- **Release automation telemetry.** Changesets-driven releases produce consistent CHANGELOG entries; missing changesets fail PR checks.
- **npm download metrics** on `@morpho-org/morpho-sdk` post-launch — signal for integrator adoption.

## Security

- **Cantina scan** on every major release. Documented threat model per attack surface (inflation attack, reentrancy on bundled calls, signature replay, LLTV-liquidation race).
- **Security invariants as tests** — the codified invariants (bundler-adapter routing for deposits, LLTV buffer on combined market actions, `chainId` validation) each have a test that would fail if the invariant were removed.
- **Typed errors** prevent silent failures; integrators must handle named failure cases.
- **Pinned ABIs and addresses** — no runtime ABI fetching. Reproducible calldata byte-for-byte.
- **Deep-freeze on all outputs** — no in-flight mutation of `Transaction`.
- **No wallet access, no broadcast** — minimizes our blast radius in any partner incident.
- **Audit-friendly shape** — small, deterministic, stateless. Partners pin the exact version they ship.

## Future Considerations

- **`morpho.api.*` namespace.** Indexer-backed reads (queries, history, analytics). Requires `apiUrl` in client config. RPC-only callers never touch it. Separate TIB.
- **Pure simulation.** `(inputs, state snapshot) → projected outcome`. No workers, no hidden fetches. Separate TIB.
- **`morpho-sdk-react`** (opt-in). If demand materializes, a separate package with React hooks that wrap `morpho-sdk`. Never a core dep.
- **Markets V2.** When the protocol ships V2 data model, evaluate whether to accommodate inside v1.x or cut v2.0 of the SDK alongside.
- **Write API.** REST endpoints wrapping the SDK for non-TypeScript stacks (Coinbase Go, etc.). Product Plan Phase 3. The SDK stays the single source of business logic.
- **Real-time feeds.** WebSockets / webhooks for health factor changes, cap updates. Product Plan Phase 4.

## Bundler 4

Bundler 4 is a new bundler version (details in scope of the protocol team, not this TIB). The SDK's commitment: when Bundler 4 lands, its handlers plug into the existing `Client → Entity → Action` layering without special-casing the public API. Today's bundler-backed operations (deposits, market actions) evolve their internal routing; integrator-facing call signatures remain Protocol-faithful (§3.7) — same shape where semantics overlap, new shape where they genuinely differ.

Open questions deferred to a follow-up TIB when Bundler 4's interface is pinned:

- Does it replace bundler3 entirely for `morpho-sdk` operations, or coexist per-chain?
- New action encoders — absorbed into `morpho-sdk` internals, or kept in an updated `bundler-sdk-viem`?
- Migration window for integrators using operations whose calldata changes byte-for-byte.

## Morpho Midnight

Morpho Midnight is the next major version of the Morpho market protocol (Markets V2) — a new protocol surface, not a chain-specific deployment. The SDK's commitment: Midnight lands behind the same `Client → Entity → Action` layering as MarketV1, under a new entity (e.g. `MorphoMarketV2` / `MorphoMidnight`) with its own action set. No parallel SDK, no forked codebase, no public-API special-cases.

Consistency follows **principle #7 (Protocol-faithful API)**: operations that overlap semantically with MarketV1 (e.g. supply, borrow, repay in their conceptual forms) keep a shape that reads naturally alongside V1; operations that are genuinely new to V2 (order book, term loans, multi-collateral, rollover, etc.) get their own honest shapes — we don't cram V2 mechanics into V1-shaped APIs, and we don't invent a parallel surface for overlapping concepts.

Open questions deferred to a follow-up TIB when Midnight's interface is pinned:

- Data model: how much of MarketV1's entity shape (`MarketParams`, `AccrualPosition`, LLTV, etc.) carries over; what needs a new type.
- Coexistence: do V1 and V2 markets live side-by-side in `morpho-sdk` indefinitely, or does V1 enter a deprecation window once V2 ships?
- Version gating: does V2 support require a `morpho-sdk` major (breaking), or can it land additively in a minor because V1 operations keep working?
- Bundler surface: does V2 use bundler3, Bundler 4, or its own routing — and does any of that leak into integrator calldata?
- Test harness: fork-block pinning per V2 testnet, integration-test coverage matrix.

## Open Questions

- **Single package vs future split.** Commit to one package now, revisit only if a specific partner audit requires hard package-level isolation.
- **`zod` — keep or drop?** Runtime + bundle cost on an SDK whose inputs are TypeScript-typed. Evaluate replacement with lightweight typed guards before the v1.0 cut.
- **Tombstone duration.** 1 minor of `morpho-sdk` proposed for `consumer-sdk` re-export window. Integration team sign-off needed.
- **Docs infrastructure.** TypeDoc alone, TypeDoc + Starlight, or plugged into `docs.morpho.org`? Owner for DNS/deployment?
- **Pre-release publishing cadence.** `rc.N` weekly until 1.0, or ad-hoc when a material change lands?

## References

- [Aseem Sood — DevEx Product Plan (Notion, Apr 10 2026)](https://www.notion.so/morpho-labs/DevEx-Product-Plan-336d69939e6d81f5862defa54cdea16a) — parent product plan this TIB implements.
- [Linear — Open-sourcing consumer-sdk project](https://linear.app/morpho-labs/project/open-sourcing-consumer-sdk-7cf8dea412b1/overview)
- [`morpho-org/consumer-sdk` PR #112](https://github.com/morpho-org/consumer-sdk/pull/112)
- [`morpho-org/sdks`](https://github.com/morpho-org/sdks) — destination monorepo.
- [TIB-2026-04-08 — TIB structure](https://github.com/morpho-org/morpho-apps/blob/main/docs/tibs/TIB-2026-04-08-tib-structure.md) — template source.
- Tom Reppelin — SDK assessment (Sept 2025, Notion).
- Paperclip Partner Call — SDK ecosystem feedback (Feb 2026, Granola).
- *Helping integrators Write: SDK vs API* — Granola call (Apr 2, 2026).
