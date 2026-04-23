---
"@morpho-org/morpho-sdk": patch
---

Fix mixed-account hazard in `MorphoMarketV1.repayWithdrawCollateral()` (SDK-100 / MORP2-69).

The bundle's `morphoWithdrawCollateral` action acts on the transaction initiator (`msg.sender`) — the bundler exposes no `onBehalf` parameter for it — while the repay leg was hardcoded to `onBehalf = userAddress`. In account-less / public-client flows where a quote is built for one address but signed by another, this could atomically repay one Morpho account's debt while withdrawing the signer's collateral to the embedded `userAddress`.

`validateUserAddress` is now strict: it throws `MissingClientPropertyError("account")` when the client has no connected account, in addition to the existing `AddressMismatchError` on mismatch. The builder of the transaction (whose account fills `userAddress`) MUST be the same account that executes/signs it. This is documented on `MarketV1Actions.repayWithdrawCollateral`.
