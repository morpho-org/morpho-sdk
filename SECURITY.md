# Security Policy

`@morpho-org/morpho-sdk` is a TypeScript SDK used to build transactions that move real funds on the Morpho protocol. We take security reports seriously.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security reports.**

To report a vulnerability, email **security@morpho.org** with:

- A description of the issue and its impact.
- Steps to reproduce, ideally with a minimal proof-of-concept.
- The SDK version.
- Any suggested mitigation.

You will receive an acknowledgement within **72 hours**. We aim to provide an initial assessment and triage within **7 days**.

## Coordinated Disclosure

- Please give us reasonable time to investigate and patch before public disclosure.
- We will keep you informed of progress and credit you in the release notes (unless you prefer to remain anonymous).
- For issues affecting funds at rest or in flight, we may coordinate an out-of-cycle release and will brief known downstream integrators (e.g., wallet teams) before publishing details.

## Supported Versions

Only the latest published `1.x` minor version of `@morpho-org/morpho-sdk` receives security fixes.

| Version | Supported          |
| ------- | ------------------ |
| `1.x`   | :white_check_mark: |
| `0.x`   | :x: (upgrade)      |

The legacy `@morpho-org/consumer-sdk` package is deprecated; security fixes are published only to `@morpho-org/morpho-sdk`.

## Scope

In scope:

- Transaction-building bugs that could cause loss of funds (bad calldata, wrong `value`, missing slippage protection).
- Signature request bugs (wrong typed-data, wrong domain separator).
- Supply-chain issues in this repository or its published npm package.
- Issues in the CI/CD pipeline that could compromise published artifacts.

Out of scope:

- Issues in the underlying Morpho smart contracts — report those via the [Morpho bug bounty program](https://immunefi.com/bounty/morpho/).
- Issues in `viem` or other third-party dependencies — please report upstream.
- Social-engineering, DoS on npm/GitHub, physical attacks.

## Verification

Releases published by the official CI are signed with npm provenance via Sigstore. Consumers can verify with:

```bash
npm audit signatures
```
