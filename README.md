# Morpho SDK

> **The abstraction layer that simplifies Morpho protocol**

## ✨ How to use it? (three ways to build transactions)

### 1️⃣ **With viem extension** (Recommended)

```typescript
import { createWalletClient, http } from "viem";
import { mainnet } from "viem/chains";
import { morphoViemExtension } from "morpho-dapp";

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
  account: "0x...",
}).extend(morphoViemExtension());

const vault = client.morpho.vaultV2(
  "0x04422053aDDbc9bB2759b248B574e3FCA76Bc145"
);
const deposit = await vault.deposit({ assets: 1000000000000000000n });
console.log(deposit.tx);
console.log(await deposit.getRequirements());

const withdraw = vault.withdraw({ assets: 1000000000000000000n });
console.log(withdraw.tx);

const redeem = vault.redeem({ shares: 1000000000000000000n });
console.log(redeem.tx);
```

### 2️⃣ **With MorphoClient**

```typescript
import { createMorphoClient } from "morpho-dapp";
import { createWalletClient, http } from "viem";

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
  account: "0x...",
});

const morpho = createMorphoClient(client);

const vault = morpho.vaultV2("0x04422053aDDbc9bB2759b248B574e3FCA76Bc145");
const deposit = await vault.deposit({ assets: 1000000000000000000n });
console.log(deposit.tx);
console.log(await deposit.getRequirements());

const withdraw = vault.withdraw({ assets: 1000000000000000000n });
console.log(withdraw.tx);

const redeem = vault.redeem({ shares: 1000000000000000000n });
console.log(redeem.tx);
```

### 3️⃣ **Direct construction** (Full control)

```typescript
import { vaultV2Deposit } from "morpho-dapp";

const deposit = vaultV2Deposit({
  vault: {
    chainId: mainnet.id,
    address: "0x1234...", // vault address
    asset: "0x1234...", // asset address
  },
  args: {
    assets: 1000000000000000000n,
    shares: 995180497664595699494513674403n,
    recipient: client.account.address,
  },
});
```

## Link Integration - Local Development Guide

This guide explains how to link this local package to your Next.js application for easier debugging.

### **Step 1: Initial setup (one time only)**

```bash
# In this morpho-dapp project
pnpm run build:link
```

### **Step 2: In your other project**

```bash
# Link the local package
pnpm link morpho-dapp
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or PR.

**Made with ❤️ by the Morpho team**
