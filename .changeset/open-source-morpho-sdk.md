---
"@morpho-org/morpho-sdk": major
---

Rename `@morpho-org/consumer-sdk` to `@morpho-org/morpho-sdk` and release publicly as `1.0.0`.

Breaking change: consumers must update all import paths from `@morpho-org/consumer-sdk` to `@morpho-org/morpho-sdk`. The legacy package is deprecated on npm.

Additional changes:
- `viem` is now a declared peer dependency (`^2.0.0`); install it alongside the SDK.
- `LICENSE` (MIT), `CONTRIBUTING.md`, `SECURITY.md`, and `CODE_OF_CONDUCT.md` added.
- Public npm releases are now published with Sigstore provenance (verify with `npm audit signatures`).
