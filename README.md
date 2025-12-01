# Morpho SDK

> **The abstraction layer that simplifies Morpho protocol**

## ✨ How to use it? (three ways to build transactions)

### 1️⃣ **With MorphoClient**

```typescript
import { MorphoClient } from "@morpho-org/consumer-sdk";
import { createWalletClient, http } from "viem";

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
  account: "0x...",
});

const morpho = new MorphoClient(client);

const vault = morpho.vaultV2("0x1234...", 1); // vault address, chain ID
const deposit = await vault.deposit({
  assets: 1000000000000000000n, // vault asset amount
  userAddress: "0x1234...", // recipient address
});
console.log(deposit.buildTx());
console.log(await deposit.getRequirements());

const withdraw = vault.withdraw({
  assets: 1000000000000000000n, // vault asset amount
  userAddress: "0x1234...", // recipient address
});
console.log(withdraw.buildTx());

const redeem = vault.redeem({
  shares: 1000000000000000000n, // vault shares amount
  userAddress: "0x1234...", // recipient address
});
console.log(redeem.buildTx());
```

### 2️⃣ **Direct construction** (Full control)

```typescript
import { vaultV2Deposit } from "@morpho-org/consumer-sdk";

const deposit = vaultV2Deposit({
  vault: {
    chainId: mainnet.id,
    address: "0x1234...", // vault address
    asset: "0x1234...", // asset address
  },
  args: {
    assets: 1000000000000000000n, // vault asset amount
    maxSharePrice: 995180497664595699494513674403n,
    recipient: "0x1234...", // recipient address
  },
});
```

## Link Integration - Local Development Guide

This guide explains how to link this local package to your Next.js application for easier debugging.

### **Step 1: Initial setup (one time only)**

```bash
# In this consumer-sdk project
pnpm run build:link
```

### **Step 2: In your other project**

```bash
# Link the local package
pnpm link consumer-sdk
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or PR.

**Made with ❤️ by the Morpho team**
