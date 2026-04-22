# TIB-2026-04-21: Morpho SDK — A Coherent, Principle-Driven SDK Offering

| Field             | Value                                                   |
| ----------------- | ------------------------------------------------------- |
| **Status**        | Proposed                                                |
| **Date**          | 2026-04-21                                              |
| **Author**        | @0xbulma                                                |
| **Scope**         | Repo-wide — `consumer-sdk` → `morpho-org/sdks` monorepo |

---

## Overall Goal

**A TypeScript SDK that does one thing perfectly: build ready-to-send Morpho transactions.**

No execution. No gas estimation. No signing. No wallet connection. No caching. No framework coupling. No hidden state. No surprises.

The SDK is a **pure, deterministic calldata factory**. Given the same inputs and the same on-chain state, it returns the same `Transaction`, byte-for-byte. Everything else — wallets, tx sending, UI, simulation, analytics — is the integrator's domain.

Audit-constrained partners need to inspect exactly what they ship. A small, deterministic, stateless SDK is easy to audit, easy to pin, easy to trust. An SDK that secretly fetches, caches, or mutates is none of those things.

**The SDK is a product, not a library dump.** It has _users_ (integrators, internal and external, human _and_ AI), a _roadmap_ driven by user outcomes, _quality bars_ (security, tests, docs, DX, reliability, AI-friendliness), and _ownership_ accountable for its success in their hands. Product metrics govern: adoption, time-to-first-transaction, integration time, issue SLA, partner NPS, agent success rate.

**AI-friendliness is first class.** A meaningful share of new Morpho integrations will be built by AI agents — MCP tools, code-gen assistants, Claude Code and its siblings, partner copilots. An SDK that's clean for humans is a multiplier for agents; an SDK that's ambiguous for humans is broken for them.

One SDK. One contract. Every invariant tested. Every major audited. Every symbol documented. Every API shape agent-legible. Treated as a product.

> *"Pure functions that return ready-to-send Morpho transactions. No simulation engines, no hidden state, no framework lock-in — just calldata you can trust."*

**Explicit goals:**

- Establish `@morpho-org/morpho-sdk` as the **single, security-first, user-oriented, AI-friendly** TypeScript SDK for Morpho.
- Codify non-negotiable principles — purity, statelessness, layering, immutability, typed errors, zero framework coupling — as the contract every future change is measured against.
- Treat the SDK as a **product** with real users (human _and_ AI), product metrics, and dogfood-gated releases.
- Define an architecture that makes the SDK trivially auditable and easy to reason about for audit-constrained partners (Privi, Bitwise, Tether).
- Commit to a clear versioning & deprecation contract integrators can rely on.
- Consolidate into the existing `morpho-org/sdks` monorepo so internal deps become `workspace:*` and the release story is unified.

---

## Core Values

Every decision in this TIB — scope, principles, what to defer, what to refuse — is measured against [Morpho's Core Values](https://www.notion.so/morpho-labs/Morpho-s-Core-Values-7eef0cb4b0ed4ed8918df2080de33687). The values are the decision lens; the principles and commitments below are how they land in this codebase.

- **Laser-Focused.** The SDK does one thing — build ready-to-send Morpho transactions. Framework wrappers, simulation engines, UI, risk management are out of scope by design. Non-goals in this TIB are load-bearing; a request that doesn't make an integration faster or safer is declined.
- **First Principles.** The non-negotiable principles below _are_ the justification, not convention. When a change conflicts with a principle, the change is under scrutiny, not the principle. Every design decision is documented with its _why_.
- **Simplicity.** Fewer lines, fewer deps, fewer exports, fewer abstractions. `morpho-sdk` + `viem` is the full integrator install. Types at risk of upstream churn are re-declared locally rather than taken as transitive deps. Helpers whose utility is unclear are removed to see what breaks.
- **Obsessed with Critical Feedback.** Integrator friction surfaces fast and publicly. API mistakes, missed deprecations, and broken migrations are dissected in post-mortems linked from the CHANGELOG — not buried.
- **Bias for Action.** Partner-blocking issues ship as patches on demand. Examples, docs, and codemods are first-class work, not afterthoughts.

These values show up in the principles, the specific goals, and the DevEx contract that follow.

---

## Specific Goals

Four pillars — what the SDK commits to doing at product grade. Each pillar deepens into concrete posture, verification, or practice.

### 1. Build & Maintain

Grow the SDK within the non-negotiable principles (below), and maintain every shipped surface at product grade.

- Execute the roadmap within those principles — every principle is load-bearing.
- Say no to scope that violates a principle. Write a new TIB when a principle needs to evolve.
- Absorb rather than re-export: types at risk of upstream churn get re-declared locally so `morpho-sdk`'s version story stays decoupled.
- Triage integrator bugs and feature requests on arrival.
- Patch releases on-demand; minors on rolling cadence; majors via release plans with migration guides.
- Enforce deprecations via the 4-step flow (see §Versioning & Deprecation) — no silent removals, no shortcut breakage.
- `main` is always releasable. Forbidden-import and layered-import lint rules always green (_commitment for v1.0_).

### 2. Secure, Tested & Audited

Security is the posture. Testing and audits are the evidence. Code is written as if Cantina will read it next week — because they will.

**Posture.**

- Security invariants codified as tests: inflation-attack routing, LLTV buffer, `chainId` validation. Removing the invariant fails the test.
- Typed errors for every failure mode. No silent failures, no `throw new Error(...)`. `deepFreeze` on all `Transaction` outputs.
- Pinned ABIs and addresses in-package — no runtime ABI fetch, no address drift.
- No bypass of protocol-level safety: deposits through the general adapter, combined market actions behind the LLTV buffer.
- Security concerns escalate immediately; security-driven patches jump the queue.
- No wallet access, no broadcast — minimizes blast radius in any partner incident.
- Audit-friendly shape — small, deterministic, stateless. Partners pin the exact version they ship.

**Verification.**

- Unit tests on every action; fork-based integration tests on every entity fetcher. Test coverage is a commitment, not a vanity metric.
- Fork suite runs in CI against pinned blocks per chain matrix; green suite gates every release.
- Property-based tests (`fast-check`) on calldata encoders.
- Coverage threshold enforced in CI (target ≥ 90% on `src/`; frozen at v1.0 cut).

**Audit.**

- Cantina audit on every major. Scope: `morpho-sdk` + any internal workspace deps whose code ships in user-facing calldata.
- Dependency security audits (`pnpm audit` + socket.dev or equivalent) on every minor. Critical CVEs trigger out-of-band patches.
- Threat model per attack surface (inflation, reentrancy in bundles, signature replay, LLTV-liquidation race) — reviewed on every major and whenever a new protocol surface lands.
- Public audit reports linked from the CHANGELOG entry of the audited release.
- Pre-release dogfood on every minor: at least one internal app and one external partner before the `latest` tag flips.

### 3. Document & Make AI-legible

Docs are a feature, not an afterthought. An undocumented symbol is a bug. **Docs serve humans _and_ AI agents equally** — integrators increasingly are agents.

- **JSDoc mandatory on every exported symbol** — what it does, what it reads on-chain, what it throws, with an example. Missing JSDoc fails lint.
- TypeDoc-generated API reference published per release.
- **AI-first docs surface:** LLM-optimized markdown chunks, `/llms.txt` (Wagmi's model), single-file recipes as few-shot examples, machine-readable index on the docs site.
- **API shapes agent-legible:** identical signatures where semantics overlap across protocol versions, discriminated unions with obvious `type` tags, `@throws` JSDoc on typed errors, deterministic outputs verifiable byte-for-byte.
- **Error messages read like instructions** — an agent should act on one without guessing.
- `morpho-sdk-examples`: one runnable file per operation, kept green. Our highest-value training surface for agents.
- Migration guides on every major, with codemods where mechanical.
- CHANGELOG via Changesets — every user-visible change has a changeset, or CI fails.
- TIBs for substantive decisions; public roadmap in GitHub Projects; `CONTRIBUTING.md` with a real fork-test harness for external contributors.
- Feedback loop: if the same question is asked twice, it becomes a doc section.

### 4. Engage Users & Drive Adoption

Users are the product's north star. Link with them, measure them, drive them into the happy path.

**Protocol (downward).** Every protocol change with an SDK surface has an SDK-side representative in the design loop _before_ it ships. Protocol decisions inform the SDK; SDK needs inform protocol interfaces. No surprise releases in either direction.

**Internal users.** Morpho's app surfaces (Vault, curator tools, MCP server, future write/simulation APIs) are the SDK's first and hardest users. Every internal app migrates onto `morpho-sdk` before v1.0 stable — dogfood is a release gate, not an aspiration. Internal friction is the backlog.

**External users.** Priority integrators — Tether, Bitwise, Privi, Coinbase, Paperclip — are customers of a product. Regular touchpoints, feedback sessions, visible roadmap. Active support when it unblocks them: PR reviews on their codebases, codemods. Their DevEx is ground truth on every claim the SDK makes.

**AI agents.** MCP tools, Claude Code, partner copilots, code-gen assistants — a first-class user class. The MCP server wraps `morpho-sdk` with zero business-logic duplication; skill/plugin manifests for Claude Code and equivalents land AI-generated integrations in the happy path by default. Agent failures feed docs and API-shape decisions the same way human failures do.

**Measurable outcome.** 100% of new integrations (human or agent) use the SDK directly — no custom wrappers. Agent-generated integrations work in one prompt > 90% of the time. A wrapper in the wild or a repeated agent failure is a signal the API missed something — investigated like a retention problem.

---

## Non-Negotiable Principles

The through-lines of the SDK. If a change violates one, the change doesn't land.

1. **Pure I/O.** Actions are `(args: Args) => Transaction<TType>`. No side effects, no network, no clock, no randomness. Actions are not `async`. Network I/O exists in exactly one layer — entity fetchers — and is always named, typed, and documented.
2. **Strictly stateless.** `MorphoClient` wraps a `viem.Client` + options. It does not cache on-chain data, not even opportunistically. No `init()`, no warm-up. The SDK has no lifecycle. Integrators either pass state in or re-fetch.
3. **Layered, one-way.** `Client → Entity → Action`. Calls flow strictly downward. Actions never call entities; entities never construct clients. _Commitment:_ a forbidden-import lint rule at folder boundaries lands before v1.0 to enforce this structurally.
4. **Immutable outputs.** Every returned `Transaction` is `deepFreeze`-d. No in-flight mutation. No ambiguity about what will be sent.
5. **Strict TypeScript, zero `any`.** All `strict` flags on. Discriminated unions for action types. `readonly` on every public property. Exhaustive `switch` enforced at the type level. If something is hard to type, the API is wrong — fix the API.
6. **Typed errors as public API.** No `throw new Error(...)`. Every failure mode is a named, exported class. Integrators pattern-match on classes, not strings.
7. **Protocol-faithful API.** Where protocols overlap (e.g. ERC-4626 deposits across VaultV1 and VaultV2), the SDK offers a consistent shape. Where they genuinely differ — force-deallocation, market lending, future bundlers, chain-specific handlers — the difference is exposed honestly. No forced sameness, no manufactured complexity.
8. **No framework coupling.** No wagmi, React, ethers, Redux, or RxJS. `viem` is the only peer dep. Framework helpers, if ever needed, are separate opt-in packages — never a runtime dep of core. _Commitment:_ a forbidden-import lint rule lands before v1.0 to enforce this in CI.
9. **RPC-only in v1.0.** Zero dependency on Morpho-operated infrastructure. Any RPC + viem is sufficient for the full public surface. When indexer-backed reads land later, opting out keeps this principle true.
10. **Security invariants codified as tests.** Prose in docs is a guide, not a guarantee. Every security invariant (inflation-attack defense, LLTV buffer, `chainId` validation) is asserted by a test that would fail if removed.

---

## Roadmap

A product roadmap driven by integrator outcomes. Each step ships when its user-visible outcome is proven in a real integrator's hands.

| #  | Step                                                          | Outcome                                                                                                                          | Target                              |
| -- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 1  | **Open-source `consumer-sdk` as `morpho-sdk`**                | Public repo, rename to `@morpho-org/morpho-sdk`.                                                                                 | 2026-04-27 (Cantina scan gate)      |
| 2  | **Vault: migrate Vault V1 → Vault V2**                        | New handler.                                                                                                                     | End of April 2026                   |
| 3  | **Migrate `morpho-sdk` into the `morpho-org/sdks` monorepo**  | Single monorepo, shared tooling, Changesets introduced, workspace deps, v1.0.0 cut.                                              | May–June 2026                       |
| 4  | **EVM simulation package**                                    | Simulation handlers only (package of pure handlers, not a hosted service).                                                       | May 2026                            |
| 5  | **Tempo wallet integration**                                  | Support integration.                                                                                                             | Early May 2026                      |
| 6  | **Tether WDK integration**                                    | Support integration.                                                                                                             | Early May 2026                      |
| 7  | **Vault: force withdraw with penalties**                      | New handler.                                                                                                                     | May 2026                            |
| 8  | **Vault: migrate AAVE V3**                                    | New handler.                                                                                                                     | May 2026                            |
| 9  | **Vault: in-kind redemption**                                 | New handler.                                                                                                                     | June 2026                           |
| 10 | **Market: direct supply**                                     | New handler.                                                                                                                     | June 2026                           |
| 11 | **Clean up / remove legacy SDK packages**                     | `simulation-sdk` and wagmi helpers sunset; package landscape matches the Product Plan's 6-month table.                           | May–June 2026                       |
| 12 | **Bundler 4**                                                 | New bundler-version handlers behind the same `Client → Entity → Action` layering — no public-API special-casing (see §Bundler 4). | Upcoming, driven by protocol timing |
| 13 | **Repay with collateral / Multiply**                          | Swap-based handlers built on Bundler 4.                                                                                          | TBD                                 |
| 14 | **Midnight protocol actions**                                 | Scope TBD (see §Morpho Midnight).                                                                                                | TBD                                 |
| 15 | **Curator actions**                                           | Scope TBD.                                                                                                                       | TBD                                 |
| 16 | **Bitgo integration**                                         | Support integration.                                                                                                             | TBD                                 |
| 17 | **Privy integration**                                         | Support integration.                                                                                                             | TBD                                 |
| 18 | **Dynamic integration**                                       | Support integration.                                                                                                             | TBD                                 |

Sequencing commitments:

- **Steps 1 and 3 are foundation.** Open-sourcing first (Cantina gate), then monorepo consolidation. Every other step assumes the SDK is public and in the monorepo.
- **Step 11 closes the v1.0 consolidation story** — legacy packages sunset alongside the migration.
- **Protocol handlers (2, 7–10, 13–15)** plug into the existing `Client → Entity → Action` layering. No public-API special-casing. Principle #7 (Protocol-faithful API) governs V1↔V2 shape decisions.
- **Integrator support items (5, 6, 16–18)** are engagement work feeding backlog — not new SDK surface area.
- **Bundler 4 (12)** unlocks 13 and any future Bundler-4-dependent handlers.

Step-3 migration details (execution owned in a separate migration doc):

- Drop sources into `packages/morpho-sdk/`. Preserve history via `git subtree`.
- Convert Morpho deps to `workspace:^`. Remove `@morpho-org/simulation-sdk` (inline constants + local types).
- Align tooling (Biome, tsconfig, Vitest, anvil fixtures from `@morpho-org/test`) with monorepo root.
- Introduce Changesets at monorepo root (load-bearing for v1.0 release mechanics).
- Add to CI matrix; wire `MAINNET_RPC_URL` at destination.
- Rename `consumer-sdk` → `morpho-sdk`, cut `1.0.0-rc.0`, dogfood with Tether WDK, then cut `1.0.0` stable.
- Tombstone `@morpho-org/consumer-sdk` with a final re-export release.

Post-v1.0 (out of this TIB, covered separately): indexer-backed reads (`morpho.api.*`), a hosted simulation service wrapping the step-4 handler package, historical / analytics. Designed so the RPC-only principle holds for callers that opt out.

---

## Architecture

### Three layers, one direction

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

### Boundaries the SDK defends

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

---

## DevEx Contract

A summary of what the SDK commits to integrators. Comprehensive detail in Specific Goals above.

| Commitment                     | Concrete form                                                                                                   |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Stable public API              | SemVer. Breaking changes only on major. Deprecation window ≥ 1 minor with `@deprecated` JSDoc + CHANGELOG entry. |
| Zero-overhead install          | `morpho-sdk` + `viem`. No other `@morpho-org/*` deps surfaced on the happy path.                                |
| Typed errors as public API     | Every failure class exported; pattern-match, don't string-match.                                                |
| Predictable I/O                | Every function's JSDoc lists the exact on-chain reads it triggers.                                              |
| Protocol-faithful API          | Consistent shape where protocols overlap; honest differences where they genuinely differ (principle #7).        |
| First-class, AI-legible docs   | TypeDoc + handwritten recipes. LLM-optimized markdown chunks, `/llms.txt` (Wagmi's model), machine-readable index. |
| Agent-legible API shapes       | Discriminated unions with obvious `type` tags, `@throws` JSDoc on typed errors, deterministic outputs verifiable byte-for-byte. |
| Error messages as instructions | An agent should act on a thrown message without guessing.                                                       |
| Examples repo                  | `morpho-sdk-examples` — one runnable file per operation, kept green against every release.                      |
| Migration guides               | Every major release ships a migration guide + codemods where mechanical.                                        |
| CHANGELOG via Changesets       | Every user-visible change has a changeset, or CI fails.                                                         |
| Fork-based test harness        | Integrators can run against a pinned block with an Alchemy key.                                                 |
| Pinned ABIs and addresses      | Ship in-package, not fetched at runtime.                                                                        |
| Dogfood as release gate        | Morpho's own products migrate onto `morpho-sdk` before v1.0 stable.                                             |
| Feedback loop to docs          | If the same integrator question is asked twice (human or agent), it becomes a doc section.                      |

---

## Versioning & Deprecation

### SemVer

The public API is exactly what the root `src/index.ts` barrel exports — nothing else is contract.

- **Major** — breaking changes.
- **Minor** — additive: new operations, options, error classes, chain support.
- **Patch** — bug fixes that preserve behavior, docs, invisible internal refactors.

Breaking includes: removing/renaming an export, adding required fields to an exported type, changing a function signature, changing thrown errors callers depend on, changing runtime behavior integrators rely on, bumping the `viem` peer-dep minimum, or adding a security invariant that rejects previously-allowed input (yes — even when correct).

Not breaking: internal refactors, new optional fields, new overloads, bug fixes that align behavior with documented contract, internal `@morpho-org/*` workspace-dep bumps that don't change `morpho-sdk`'s surface.

### Deprecation — the 4 steps

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

### Release mechanism

Changesets-driven. Every user-visible change ships with a changeset (no changeset → CI fails). Patch releases are lightweight (single reviewer). Major releases require a release plan, representative integrator sign-off, and a migration guide. Pre-release channels use `rc.N` / `beta.N` / `alpha.N` via npm dist-tags and never publish to `latest`.

### Package rename (`consumer-sdk` → `morpho-sdk`)

Outside normal SemVer. Final `@morpho-org/consumer-sdk` release re-exports `morpho-sdk@1.0.0` with `@deprecated` notice and a `console.warn`. Supported for 1 minor of `morpho-sdk` (~1 month), then a tombstone release.

### Chain support version policy

Adding a Tier-1 chain → minor. Tier-2 → Tier-1 promotion → minor. Removing chain support → major. Address change on an existing chain → minor, prominently called out in CHANGELOG (integrators may pin addresses for audit).

---

## Coding Conventions

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

---

## Success Metrics

Product metrics, not vanity metrics. From the Product Plan, with TIB additions:

- **Time to first transaction:** < 10 minutes — for humans and agents.
- **Partner SDK adoption:** 100% of new integrations via the SDK, vs custom wrappers.
- **Agent success rate:** single-prompt → valid Morpho transaction > 90%.
- **SDK/frontend consistency:** zero critical issues from logic divergence.
- **Integration time:** < 1 day signing-to-production.
- **Release predictability:** no unplanned majors; every deprecation honors the 4-step flow.
- **Issue SLA:** severity-tiered, to be finalized with the integrator feedback loop.

These numbers are revisited every release. A regression on any of them is a product signal that shapes follow-up docs and API changes.

---

## Context

Morpho's TypeScript surface today is fragmented across 10+ published packages (`blue-sdk`, `blue-sdk-viem`, `bundler-sdk-viem`, `simulation-sdk`, `morpho-ts`, plus wagmi helpers and specialized consumers). Integrators routinely report the same friction: *too many packages, unclear entry point, no single place to file issues*. At the same time, `@morpho-org/consumer-sdk` has matured into a clean, layered, pure-I/O transaction builder — but it lives in its own private repo and is not the canonical surface integrators reach for.

Two forcing functions align now:

1. **Tether WDK launch** (target 2026-04-27) is blocked on `consumer-sdk` being public. Cantina security scan is in flight.
2. The ***DevEx Product Plan*** (Apr 10 2026) commits Morpho to converging on a single SDK — `@morpho-org/morpho-sdk` — as the one place business logic lives. Every other surface (MCP server, write API, partner apps, Morpho's own products) becomes a thin wrapper.

This TIB does not invent the SDK. It **codifies** the principles and architectural decisions that make the Product Plan's commitment durable — so the SDK stays coherent as it grows, and so integrators, contributors, and future agents all share the same mental model.

---

## Current Solution

- `@morpho-org/consumer-sdk` v0.6.0 — **private**, single-package, ready to open-source. Already embodies most of the principles above (layered Client → Entity → Action, pure transaction builders, immutable outputs, strict TS, zero `any`). Covers VaultV1 (MetaMorpho), VaultV2, and MarketV1 write operations.
- `morpho-org/sdks` — public monorepo with 10+ `@morpho-org/*` packages. No Changesets. Several packages have drifted (simulation-sdk, wagmi helpers) and are marked for deprecation in the Product Plan.
- Without action: Tether WDK slips, integrators keep forking custom wrappers, the SDK story stays incoherent, and the principles that make `consumer-sdk` good dilute as it grows.

---

## Non-Goals

- Indexer-backed reads (`morpho.api.*`) — deferred to a later TIB.
- Hosted simulation API, historical/analytics queries, real-time data (webhooks) — deferred. (A simulation-handler *package* is in the roadmap above as step 4; a hosted service wrapping it is separate.)
- Framework helpers (React hooks, wagmi adapters) — explicitly out of core.
- Deprecating Bundler3 or `@morpho-org/bundler-sdk-viem` — protocol decision, not this TIB's concern.
- New protocol features, Markets V2 design, or any on-chain change.
- **Owning and executing** the migration of each Morpho app onto the SDK — each app is responsible for its own migration. v1.0 stable is gated on at least one successful internal dogfood (see DevEx Contract, "Dogfood as release gate").

---

## Assumptions & Constraints

- Cantina security scan completes without critical findings by 2026-04-27.
- `morpho-org/sdks` monorepo accepts Changesets as its release mechanism (currently absent).
- The `@morpho-org/test` package can host or already hosts shared anvil fixtures (sibling packages `liquidation-sdk-viem`, `bundler-sdk-viem` use fork-based tests — check before migration).
- Tether WDK remains the near-term driving forcing function; delays in WDK do not weaken the case for consolidation.
- `viem` remains Morpho's chosen Ethereum client library. Migration off viem would require a new TIB.
- The Product Plan's sunset list (`simulation-sdk`, wagmi helpers) is settled direction; no stakeholder reverses it during v1.0 execution.
- V1 vault support stays in v1.0 (existing, works). No V1-specific new features after v1.0.

---

## Dependencies

- `viem@^2.48.1` — peer dep, pinned to tested minor.
- Internal workspace deps: `@morpho-org/blue-sdk`, `blue-sdk-viem`, `bundler-sdk-viem`, `morpho-ts` — consumed as `workspace:^` after migration.
- `@morpho-org/test` — dev-dep, fork test harness.
- `morpho-org/sdks` monorepo access for the migration PR.
- Cantina scan completion to unblock the public repo flip.
- Product Plan approval — this TIB derives from it.

---

## Observability

- **Bundle size budget in CI** _(commitment for v1.0)_. Per-entry-point tree-shake assertion. Importing one action must not pull in unrelated code.
- **Forbidden-import lint rule** _(commitment for v1.0)_. CI will fail on any import of `wagmi`, `@wagmi/*`, `ethers`, `react`.
- **Layered-import lint rule** _(commitment for v1.0)_. CI will fail if an action imports from entities, or entities import from client.
- **Fork test suite** in CI with `MAINNET_RPC_URL`, pinned block, per-chain matrix. (Present today.)
- **Release automation telemetry** _(commitment for v1.0)_. Changesets-driven releases produce consistent CHANGELOG entries; missing changesets fail PR checks.
- **npm download metrics** on `@morpho-org/morpho-sdk` post-launch — signal for integrator adoption.

---

## Future Considerations

- **`morpho.api.*` namespace.** Indexer-backed reads (queries, history, analytics). Requires `apiUrl` in client config. RPC-only callers never touch it. Separate TIB.
- **Hosted simulation service.** Once the EVM simulation handler package (roadmap #4) ships, a hosted REST service wrapping it is the natural next step. Separate TIB.
- **`morpho-sdk-react`** (opt-in). If demand materializes, a separate package with React hooks that wrap `morpho-sdk`. Never a core dep.
- **Write API.** REST endpoints wrapping the SDK for non-TypeScript stacks (Coinbase Go, etc.). Product Plan Phase 3. The SDK stays the single source of business logic.
- **Real-time feeds.** WebSockets / webhooks for health factor changes, cap updates. Product Plan Phase 4.

(Markets V2 / Morpho Midnight and Bundler 4 have dedicated sections below.)

---

## Bundler 4

Bundler 4 is a new bundler version (details governed by the protocol, not this TIB). The SDK's commitment: when Bundler 4 lands, its handlers plug into the existing `Client → Entity → Action` layering without special-casing the public API. Today's bundler-backed operations (deposits, market actions) evolve their internal routing; integrator-facing call signatures remain Protocol-faithful (principle #7) — same shape where semantics overlap, new shape where they genuinely differ.

Open questions deferred to a follow-up TIB when Bundler 4's interface is pinned:

- Does it replace bundler3 entirely for `morpho-sdk` operations, or coexist per-chain?
- New action encoders — absorbed into `morpho-sdk` internals, or kept in an updated `bundler-sdk-viem`?
- Migration window for integrators using operations whose calldata changes byte-for-byte.

---

## Morpho Midnight

Morpho Midnight is the next major version of the Morpho market protocol (Markets V2) — a new protocol surface, not a chain-specific deployment. The SDK's commitment: Midnight lands behind the same `Client → Entity → Action` layering as MarketV1, under a new entity (e.g. `MorphoMarketV2` / `MorphoMidnight`) with its own action set. No parallel SDK, no forked codebase, no public-API special-cases.

Consistency follows **principle #7 (Protocol-faithful API)**: operations that overlap semantically with MarketV1 (e.g. supply, borrow, repay in their conceptual forms) keep a shape that reads naturally alongside V1; operations that are genuinely new to V2 (order book, term loans, multi-collateral, rollover, etc.) get their own honest shapes — V2 mechanics aren't crammed into V1-shaped APIs, and no parallel surface is invented for overlapping concepts.

Open questions deferred to a follow-up TIB when Midnight's interface is pinned:

- Data model: how much of MarketV1's entity shape (`MarketParams`, `AccrualPosition`, LLTV, etc.) carries over; what needs a new type.
- Coexistence: do V1 and V2 markets live side-by-side in `morpho-sdk` indefinitely, or does V1 enter a deprecation window once V2 ships?
- Version gating: does V2 support require a `morpho-sdk` major (breaking), or can it land additively in a minor because V1 operations keep working?
- Bundler surface: does V2 use bundler3, Bundler 4, or its own routing — and does any of that leak into integrator calldata?
- Test harness: fork-block pinning per V2 testnet, integration-test coverage matrix.

---

## Open Questions

- **Single package vs future split.** Commit to one package now, revisit only if a specific partner audit requires hard package-level isolation.
- **`zod` — keep or drop?** Runtime + bundle cost on an SDK whose inputs are TypeScript-typed. Evaluate replacement with lightweight typed guards before the v1.0 cut.
- **Tombstone duration.** 1 minor of `morpho-sdk` proposed for `consumer-sdk` re-export window. Representative integrator sign-off needed.
- **Docs infrastructure.** TypeDoc alone, TypeDoc + Starlight, or plugged into `docs.morpho.org`? Owner for DNS/deployment?
- **Pre-release publishing cadence.** `rc.N` weekly until 1.0, or ad-hoc when a material change lands?
- **Issue SLA finalization.** Severity tiers, triage turnaround per severity — to be set with integrator feedback.

---

## References

- [DevEx Product Plan (Notion, Apr 10 2026)](https://www.notion.so/morpho-labs/DevEx-Product-Plan-336d69939e6d81f5862defa54cdea16a) — parent product plan this TIB implements.
- [Morpho's Core Values](https://www.notion.so/morpho-labs/Morpho-s-Core-Values-7eef0cb4b0ed4ed8918df2080de33687) — decision lens for this TIB.
- [Linear — Open-sourcing consumer-sdk project](https://linear.app/morpho-labs/project/open-sourcing-consumer-sdk-7cf8dea412b1/overview)
- [`morpho-org/consumer-sdk` PR #112](https://github.com/morpho-org/consumer-sdk/pull/112)
- [`morpho-org/sdks`](https://github.com/morpho-org/sdks) — destination monorepo.
- [TIB-2026-04-08 — TIB structure](https://github.com/morpho-org/morpho-apps/blob/main/docs/tibs/TIB-2026-04-08-tib-structure.md) — template source.
- SDK assessment (Notion, Sept 2025).
- Paperclip Partner Call — SDK ecosystem feedback (Granola, Feb 2026).
- *Helping integrators Write: SDK vs API* — Granola call (Apr 2, 2026).
