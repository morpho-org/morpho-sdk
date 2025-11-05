# Morpho DApp SDK

> **The abstraction layer that simplifies Morpho protocol**

## ✨ How to use it? (two ways to build transactions)

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

const vault = morpho.vaultV2("0x04422053aDDbc9bB2759b248B574e3FCA76Bc145");
const deposit = await vault.deposit({ assets: 1000000000000000000n });
console.log(deposit.tx);
console.log(await deposit.getRequirements());

const withdraw = vault.withdraw({ assets: 1000000000000000000n });
console.log(withdraw.tx);

const redeem = vault.redeem({ assets: 1000000000000000000n });
console.log(redeem.tx);
```

### 2️⃣ **Direct construction** (For experts) (Full control)

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
