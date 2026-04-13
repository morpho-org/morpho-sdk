# @morpho-org/consumer-sdk

## 0.5.0

### Minor Changes

- 2bb4058: Add MarketV1 (Morpho Blue) support with full suite of operations: `supplyCollateral`, `borrow`, `supplyCollateralBorrow`, `repay`, `withdrawCollateral`, and `repayWithdrawCollateral`. All actions are routed through bundler3 via GeneralAdapter1 with slippage protection (`minSharePrice`/`maxSharePrice`), LLTV buffer validation, and comprehensive position health checks. Includes shared liquidity reallocations via PublicAllocator for borrow operations, new `MorphoMarketV1` entity with `fetchMarket`/`fetchPosition`, and deployless read support.

### Patch Changes

- 3e045c0: Fix total borrow calculation to include +1 wei adjustment for share-to-asset rounding in debt validation after borrowing.
- 537539a: Fix chain ID validation in VaultV1 and VaultV2 `getData` methods.

## 0.4.0

### Minor Changes

- 1b5f2bd: Add VaultV1 (MetaMorpho) support with `deposit`, `withdraw`, and `redeem` operations. Deposit is routed through bundler3 with general adapter enforcement (`maxSharePrice` protection against inflation attacks). Withdraw and redeem are direct vault calls. Both VaultV1 and VaultV2 deposits now support optional `nativeAmount` parameter for native token wrapping via `GeneralAdapter1.wrapNative()` on wNative vaults (e.g. deposit ETH directly into a WETH vault). Includes new `MorphoVaultV1` entity, action builders, dedicated error classes, and comprehensive test coverage.

## 0.3.0

### Minor Changes

- 33af11e: Add `forceWithdraw` and `forceRedeem` VaultV2 operations that allow users to free liquidity from non-liquidity adapters (e.g., Morpho Market V1 adapters, Vault V1 adapters) and withdraw or redeem in a single atomic transaction via VaultV2's native `multicall`. `forceWithdraw` is asset-based (specify exact assets to withdraw), while `forceRedeem` is share-based (specify exact shares to redeem). A penalty is taken from the caller for each deallocation to discourage allocation manipulation, applied as a share burn that keeps the share price stable. Includes new `Deallocation` type, `encodeForceDeallocateCall` helper, dedicated error classes (`EmptyDeallocationsError`, `DeallocationsExceedWithdrawError`), and entity-level integration on `MorphoVaultV2`.

## 0.2.0

### Minor Changes

- c499a72: Add fetch parameters

### Patch Changes

- 824ba5a: fix: prevent fund loss in deposit flow when signature params diverge from deposit params

## 0.1.8

### Patch Changes

- 8fc6bb5: Add supportDeployless option in morpho client

## 0.1.7

### Patch Changes

- 0f25e4a: Update morpho SDKs

## 0.1.6

### Patch Changes

- 0f55974: Introduce useSimplePermit in getRequirements

## 0.1.5

### Patch Changes

- 6f1fd28: Update morpho SDKs (fix maxDeposit with marketV1AdapterV2)

## 0.1.4

### Patch Changes

- dd9564a: fix: fetchToken for permit with viem client from morpho

## 0.1.3

### Patch Changes

- e36e454: fix use chainId in params for fetch data

## 0.1.2

### Patch Changes

- 91cf75d: Remove specific permit dai flow and use permit2 instead

## 0.1.1

### Patch Changes

- 93ccfc0: Fix sufficient allowant on permit2 flow
- 5db470d: Update morpho sdks to latest version

## 0.1.0

### Minor Changes

- 858f0e4: Introduce off-chain signature requirements: (permit, permit dai, permit2)
  New e2e and unit test
  Update viem to 2.41.2

## 0.0.4

### Patch Changes

- 501b65d: Fix workflow release

## 0.0.3

### Patch Changes

- 9c13b20: Change user in example

## 0.0.2

### Patch Changes

- 6fd03c8: Add disclaimer in readme
