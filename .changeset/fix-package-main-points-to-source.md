---
"@morpho-org/morpho-sdk": patch
---

Fix published package entrypoint so the root import `@morpho-org/morpho-sdk` resolves to the compiled output.

`1.0.0` shipped with `"main": "src/index.ts"` because the `publishConfig.main` / `publishConfig.types` overrides are not promoted by `npm publish` (only `pnpm publish` does that, and the release workflow ends up calling `npm publish`). The tarball only contains `lib/`, so consumers hit `Cannot find module './actions'`-style errors and have to fall back to deep imports like `@morpho-org/morpho-sdk/lib/index.js`.

`main`, `types`, and a minimal `exports` block are now declared at the top level of `package.json`, so the root import resolves to `lib/index.js` / `lib/index.d.ts` regardless of which package manager publishes.
