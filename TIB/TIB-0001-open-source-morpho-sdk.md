# TIB-0001: Open-Source consumer-sdk as @morpho-org/morpho-sdk v1.0.0

| Field             | Value                          |
| ----------------- | ------------------------------ |
| **Status**        | Proposed                       |
| **Date**          | 2026-04-14                     |
| **Author**        | @Benjamin                      |
| **Scope**         | Repo-wide                      |

---

## Context

The Tether WDK launch is blocked on the consumer-sdk being publicly available on npm. The SDK is currently published as `@morpho-org/consumer-sdk@0.5.0` under a private/restricted scope with experimental markers.

Aseem identified the core checklist for a public release (Slack, 2026-04-14):

> Rename consumer-sdk -> morpho-sdk, README.md (proper intro, quick start, remove experimental), add a license file, update version to 1.0.0, clean internal tests/fixtures, open-source repo.

Tarik flagged the need for a security scan (Cantina AI) before going public, and noted that Foulques (primary maintainer) is OOO this week, putting realistic timing at ~2 weeks. Aseem confirmed the target is **April 27, 2026**.

A thorough codebase audit was performed to identify all gaps between the current state and a production-ready public v1.0.0 release.

## Goals / Non-Goals

**Goals**

- Ship `@morpho-org/morpho-sdk@1.0.0` as a public npm package
- Unblock Tether WDK integration
- Ensure the public repo contains no secrets, internal references, or private infrastructure details
- Provide adequate documentation for external developers (README, CONTRIBUTING, SECURITY)
- Complete a Cantina AI security scan before release

**Non-Goals**

- Restructuring SDK architecture (the 4-layer Client -> Entity -> Action pattern is sound)
- Moving heavy Morpho SDKs to peerDependencies (they are core, not optional)
- Adding ESM + CJS dual exports map (NodeNext module resolution already works for consumers)
- Tree-shaking hints or bundle size optimization
- Full API reference documentation (README examples are sufficient for v1.0.0)

## Current Solution

The SDK exists as `@morpho-org/consumer-sdk@0.5.0`:

- Published to npm with `access: "public"` in publishConfig, but changeset config has `access: "restricted"`
- README carries a beta badge and experimental warning
- No LICENSE file (MIT declared in package.json only)
- No CONTRIBUTING.md or SECURITY.md
- `viem` is a required runtime dependency but only listed in devDependencies
- MarketV1 repay, withdrawCollateral, and repayWithdrawCollateral actions are implemented but absent from README
- GitHub repo is named `consumer-sdk`

**Audit findings (positive):**
- Zero hardcoded secrets, API keys, or internal references in source code
- All dependencies point to public npm registry
- Test fixtures use only public Ethereum mainnet contract addresses
- TypeScript strict mode with zero `any` types
- 44 typed error classes with descriptive messages
- Good JSDoc coverage on public API
- Professional changelog (Changesets format)
- CI/CD fully configured (lint, build, test, automated release with OIDC npm publish)

## Proposed Solution

Rename, document, and release the SDK publicly as `@morpho-org/morpho-sdk@1.0.0` after passing a Cantina AI security scan.

### Implementation Phases

- **Phase 1 -- Blockers (must complete before open-sourcing):**

  1. **Rename package** `@morpho-org/consumer-sdk` -> `@morpho-org/morpho-sdk`
     - `package.json`: update `name`, `repository` (`github:morpho-org/morpho-sdk`), `homepage`, `bugs.url`
     - `README.md`: update title, all import paths (`@morpho-org/consumer-sdk` -> `@morpho-org/morpho-sdk`)
     - `CLAUDE.md`: update title reference
     - GitHub: rename repository from `consumer-sdk` to `morpho-sdk` (admin action)

  2. **Add LICENSE file** at repo root
     - Standard MIT license text, copyright `Morpho Association`
     - `package.json` already declares `"license": "MIT"` -- file makes it enforceable and GitHub-detectable

  3. **Bump version to 1.0.0**
     - Update `package.json` version
     - Create changeset entry for the major version bump
     - Update CHANGELOG.md

  4. **Remove experimental/beta markers from README**
     - Remove `![Beta](https://img.shields.io/badge/status-beta-orange)` badge (line 3)
     - Remove `> ⚠️ **Experimental package**` warning (line 5)

  5. **Update README for external developers**
     - Add installation section: `pnpm add @morpho-org/morpho-sdk viem`
     - Add missing MarketV1 documentation: `repay`, `withdrawCollateral`, `repayWithdrawCollateral`
     - Add brief section explaining `getRequirements()` flow (approvals, permits, authorizations)
     - Note `viem ^2.x` as a required peer dependency

  6. **Fix changeset config**
     - `.changeset/config.json`: change `"access": "restricted"` to `"access": "public"`

- **Phase 2 -- Important (should complete before open-sourcing):**

  7. **Add `viem` to peerDependencies**
     - Currently only in `devDependencies`; consumers must install it themselves but aren't told
     - Add `"viem": "^2.0.0"` to `peerDependencies`

  8. **Add CONTRIBUTING.md**
     - Development setup: pnpm, Node version (.nvmrc -> Node 24)
     - Code style: Biome, double quotes, 2-space indent, no unused imports
     - Running tests: requires `MAINNET_RPC_URL` environment variable
     - PR process: changesets required, CI must pass
     - Reference to code of conduct

  9. **Add SECURITY.md**
     - Responsible disclosure process for vulnerabilities
     - Contact information
     - Critical for a DeFi protocol SDK handling real financial transactions

- **Phase 3 -- Polish (nice-to-have, not blocking release):**

  10. **GitHub issue/PR templates**
      - `.github/ISSUE_TEMPLATE/bug_report.md`
      - `.github/ISSUE_TEMPLATE/feature_request.md`
      - `.github/pull_request_template.md`

  11. **Add CODE_OF_CONDUCT.md** (Contributor Covenant v2.1)

  12. **Add npm keywords** for discoverability
      - `["morpho", "defi", "ethereum", "sdk", "viem", "erc4626", "lending", "borrowing"]`

  13. **Add README badges**: npm version, TypeScript, license, CI status

## Considered Alternatives

### Alternative 1: Release as v0.5.0 (keep pre-1.0)

Release publicly at the current version without bumping to 1.0.0.

**Why rejected:** Signals instability to external integrators. Tether WDK needs a stable dependency. The SDK has been through multiple minor releases and the API surface is mature.

### Alternative 2: Rename to @morpho-org/core-sdk

Use "core-sdk" instead of "morpho-sdk" as the package name.

**Why rejected:** "morpho-sdk" is more discoverable, directly identifies the protocol, and aligns with standard naming conventions (e.g., `@uniswap/sdk`). Aseem listed it as the primary option.

### Alternative 3: Strip all AI/agent files before open-sourcing

Remove CLAUDE.md, AGENTS.md, .agents/, .cursor/ from the public repo.

**Why rejected:** These files contain zero secrets -- only development guidelines. They're already excluded from the npm package by `files: ["lib"]`. Keeping them is transparent about development tooling.

## Assumptions & Constraints

- Foulques (primary maintainer) is OOO week of 2026-04-14; he should review/approve the TIB before execution
- GitHub repo rename (`consumer-sdk` -> `morpho-sdk`) requires admin access and should happen atomically with the npm package rename
- Cantina AI security scan must complete and pass before the repo is made public
- Target date for public release: **2026-04-27**
- Tether WDK team is the immediate downstream consumer and primary motivator

## Dependencies

- **Cantina AI security scan** -- must complete before repo goes public
- **GitHub admin access** -- for repo rename and visibility toggle
- **npm access** -- for publishing `@morpho-org/morpho-sdk` (existing OIDC-based release pipeline handles this)
- **Foulques review** -- as primary maintainer, should sign off on the TIB and final PR

## Security

- **Codebase audit result:** No hardcoded secrets, API keys, private URLs, or internal references found in source code, tests, or configuration
- **Test data:** All test fixtures use public Ethereum mainnet contract addresses only
- **Environment variables:** Only `MAINNET_RPC_URL` required for tests, properly managed via GitHub Secrets in CI
- **Cantina AI scan:** Blocks release. Will scan for smart contract interaction vulnerabilities, dependency issues, and open-source readiness gotchas
- **SECURITY.md:** Must be added before release to provide responsible disclosure path for vulnerabilities (critical for DeFi code handling real financial transactions)
- **CODEOWNERS:** Already guards `.github/workflows/release.yml` via `@morpho-org/security` team

## Future Considerations

- Full API reference documentation (generated from JSDoc or a docs site) -- deferred to post-1.0
- Move to a monorepo structure if additional SDK packages are created
- Bundle size optimization and tree-shaking hints for frontend consumers
- Consider adding `exports` map in package.json for more granular imports

## References

- [Slack discussion: Aseem/Tarik/Tom, 2026-04-14](internal)
- [GitHub repo: morpho-org/consumer-sdk](https://github.com/morpho-org/consumer-sdk)
- [npm: @morpho-org/consumer-sdk](https://www.npmjs.com/package/@morpho-org/consumer-sdk)
