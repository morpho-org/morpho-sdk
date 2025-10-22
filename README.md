# 🚀 Morpho DApp SDK

> **The abstraction layer that simplifies Morpho protocol**

## ✨ Three ways to build transactions

### 1️⃣ **With MorphoClient**

```typescript
import { createMorphoClient } from "morpho-dapp";
import { createWalletClient, http } from "viem";

const client = createWalletClient({
  chain: mainnet,
  transport: http(),
  account: "0x...",
});

const morpho = createMorphoClient(client);

const tx = (
  await morpho.vaultV2("0x04422053aDDbc9bB2759b248B574e3FCA76Bc145")
).deposit({ assets: 1000000000000000000n });
```

### 2️⃣ **With VaultV2 Entity**

```typescript
import { createVaultV2 } from "morpho-dapp";

const vault = await createVaultV2(
  morpho,
  "0x04422053aDDbc9bB2759b248B574e3FCA76Bc145"
);

const tx = vault.deposit({ assets: 1000000000000000000n });
```

### 3️⃣ **Direct construction** (For experts) (Full control)

```typescript
import { depositVaultV2 } from "morpho-dapp";

const tx = depositVaultV2({
  chainId: mainnet.id,
  asset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  vault: "0x04422053aDDbc9bB2759b248B574e3FCA76Bc145",
  assets: 1000000000000000000n,
  shares: 995180500366542119986981956374n,
  recipient: "0x...",
});
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or PR.

**Made with ❤️ by the Morpho team**
