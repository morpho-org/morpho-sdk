# Consumer SDK

![Beta](https://img.shields.io/badge/status-beta-orange)

> ⚠️ **Experimental package**: This SDK is currently in experimental phase.

> **The abstraction layer that simplifies Morpho protocol**

## Entities & Actions

| Entity      | Action          | Route                     | Why                                                                                     |
| ----------- | --------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| **VaultV2** | `deposit`       | Bundler (general adapter) | Enforces `maxSharePrice` — inflation attack prevention. Supports native token wrapping. |
|             | `withdraw`      | Direct vault call         | No attack surface, no bundler overhead needed                                           |
|             | `redeem`        | Direct vault call         | No attack surface, no bundler overhead needed                                           |
|             | `forceWithdraw` | Vault `multicall`         | N `forceDeallocate` + 1 `withdraw` in a single tx                                       |
|             | `forceRedeem`   | Vault `multicall`         | N `forceDeallocate` + 1 `redeem` in a single tx                                         |
| **VaultV1** | `deposit`       | Bundler (general adapter) | Same ERC-4626 inflation attack prevention as V2. Supports native token wrapping.        |
|             | `withdraw`      | Direct vault call         | No attack surface                                                                       |
|             | `redeem`        | Direct vault call         | No attack surface                                                                       |
| **MarketV1** | `supplyCollateral` | Bundler (general adapter) | `erc20TransferFrom` + `morphoSupplyCollateral`. Supports native wrapping.            |
|              | `borrow`           | Bundler (general adapter) | `morphoBorrow` with `minSharePrice` slippage protection. Requires GA1 auth.          |
|              | `supplyCollateralBorrow` | Bundler (general adapter) | Atomic supply + borrow. LLTV buffer prevents instant liquidation.              |

## VaultV2

```typescript
import { MorphoClient } from "@morpho-org/consumer-sdk";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const viemClient = createPublicClient({ chain: mainnet, transport: http() });
const morpho = new MorphoClient(viemClient);

const vault = morpho.vaultV2("0xVault...", 1);
```

### Deposit

```typescript
const { buildTx, getRequirements } = await vault.deposit({
  amount: 1000000000000000000n,
  userAddress: "0xUser...",
});

const requirements = await getRequirements();
const tx = buildTx(requirementSignature);
```

#### Deposit with native token wrapping

For vaults whose underlying asset is wNative, you can deposit native token that will be automatically wrapped:

```typescript
// Native ETH only — wraps 1 ETH to WETH and deposits
const { buildTx, getRequirements } = await vault.deposit({
  nativeAmount: 1000000000000000000n,
  userAddress: "0xUser...",
});

// Mixed — 0.5 WETH (ERC-20) + 0.5 native ETH wrapped to WETH
const { buildTx, getRequirements } = await vault.deposit({
  amount: 500000000000000000n,
  nativeAmount: 500000000000000000n,
  userAddress: "0xUser...",
});
```

The bundler atomically transfers native token, wraps it to wNative, and deposits alongside any ERC-20 amount. The transaction's `value` field is set to `nativeAmount`.

### Withdraw

```typescript
const { buildTx } = vault.withdraw({
  amount: 500000000000000000n,
  userAddress: "0xUser...",
});

const tx = buildTx();
```

### Redeem

```typescript
const { buildTx } = vault.redeem({
  shares: 1000000000000000000n,
  userAddress: "0xUser...",
});

const tx = buildTx();
```

### Force Withdraw

```typescript
const { buildTx } = vault.forceWithdraw({
  deallocations: [{ adapter: "0xAdapter...", amount: 100n }],
  withdraw: { amount: 500000000000000000n },
  userAddress: "0xUser...",
});

const tx = buildTx();
```

### Force Redeem

```typescript
const { buildTx } = vault.forceRedeem({
  deallocations: [{ adapter: "0xAdapter...", amount: 100n }],
  redeem: { shares: 1000000000000000000n },
  userAddress: "0xUser...",
});

const tx = buildTx();
```

## VaultV1

```typescript
const vault = morpho.vaultV1("0xVault...", 1);
```

### Deposit

```typescript
const { buildTx, getRequirements } = await vault.deposit({
  amount: 1000000000000000000n,
  userAddress: "0xUser...",
});

const requirements = await getRequirements();
const tx = buildTx(requirementSignature);
```

### Withdraw

```typescript
const { buildTx } = vault.withdraw({
  amount: 500000000000000000n,
  userAddress: "0xUser...",
});

const tx = buildTx();
```

### Redeem

```typescript
const { buildTx } = vault.redeem({
  shares: 1000000000000000000n,
  userAddress: "0xUser...",
});

const tx = buildTx();
```

## MarketV1

```typescript
const market = morpho.marketV1(
  {
    loanToken: "0xLoan...",
    collateralToken: "0xCollateral...",
    oracle: "0xOracle...",
    irm: "0xIrm...",
    lltv: 860000000000000000n,
  },
  1,
);
```

### Supply Collateral

```typescript
const { buildTx, getRequirements } = market.supplyCollateral({
  amount: 1000000000000000000n,
  userAddress: "0xUser...",
});

const requirements = await getRequirements();
const tx = buildTx(requirementSignature);
```

### Borrow

```typescript
const accrualPosition = await market.getPositionData("0xUser...");

const { buildTx, getRequirements } = market.borrow({
  amount: 500000000000000000n,
  userAddress: "0xUser...",
  accrualPosition,
});

const requirements = await getRequirements();
const tx = buildTx();
```

### Supply Collateral & Borrow

```typescript
const accrualPosition = await market.getPositionData("0xUser...");

const { buildTx, getRequirements } = market.supplyCollateralBorrow({
  amount: 1000000000000000000n,
  borrowAmount: 500000000000000000n,
  userAddress: "0xUser...",
  accrualPosition,
});

const requirements = await getRequirements();
const tx = buildTx(requirementSignature);
```

## Architecture

```mermaid
graph LR
    MC[MorphoClient]

    MC -->|.vaultV1| MV1
    MC -->|.vaultV2| MV2
    MC -->|.marketV1| MM1

    subgraph VaultV1 Flow
        MV1[MorphoVaultV1]
        MV1 --> V1D[vaultV1Deposit]
        MV1 --> V1W[vaultV1Withdraw]
        MV1 --> V1R[vaultV1Redeem]

        V1D -->|nativeTransfer + wrapNative + erc4626Deposit| B1[Bundler3]
        V1W -->|direct call| MM[MetaMorpho]
        V1R -->|direct call| MM
    end

    subgraph VaultV2 Flow
        MV2[MorphoVaultV2]
        MV2 --> V2D[vaultV2Deposit]
        MV2 --> V2W[vaultV2Withdraw]
        MV2 --> V2R[vaultV2Redeem]
        MV2 --> V2FW[vaultV2ForceWithdraw]
        MV2 --> V2FR[vaultV2ForceRedeem]

        V2D -->|nativeTransfer + wrapNative + erc4626Deposit| B2[Bundler3]
        V2W -->|direct call| V2C[VaultV2 Contract]
        V2R -->|direct call| V2C
        V2FW -->|multicall| V2C
        V2FR -->|multicall| V2C
    end

    subgraph MarketV1 Flow
        MM1[MorphoMarketV1]
        MM1 --> M1SC[marketV1SupplyCollateral]
        MM1 --> M1B[marketV1Borrow]
        MM1 --> M1SCB[marketV1SupplyCollateralBorrow]

        M1SC -->|erc20TransferFrom + morphoSupplyCollateral| B3[Bundler3]
        M1B -->|morphoBorrow| B3
        M1SCB -->|transfer + supplyCollateral + borrow| B3
    end

    subgraph Shared
        REQ[getRequirements]
    end

    MV1 -.->|approval / permit| REQ
    MV2 -.->|approval / permit| REQ
    MM1 -.->|approval / permit / authorization| REQ

    style B1 fill:#e8f5e9,stroke:#4caf50
    style B2 fill:#e8f5e9,stroke:#4caf50
    style B3 fill:#e8f5e9,stroke:#4caf50
    style MM fill:#fff3e0,stroke:#ff9800
    style V2C fill:#e3f2fd,stroke:#2196f3
    style REQ fill:#f3e5f5,stroke:#9c27b0
```

## Local Development

Link this package to your app for local debugging:

```bash
# In this consumer-sdk project
pnpm run build:link
```

In your other project:

```bash
# Link the local package
pnpm link consumer-sdk
```

## Contributing

Contributions are welcome! Feel free to open an issue or PR.
