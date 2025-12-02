
import { MorphoClient } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { mainnet } from "viem/chains";
import { describe } from "vitest";
import { test } from "../setup";

describe("Signature", () => {
  test("should create deposit bundle", async ({ client }) => {
    const morpho = new MorphoClient(client, true);

    const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
    const deposit = await vault.deposit({
      userAddress: client.account.address,
      assets: 1000000000000000000n,
    });
    const _requirements_1 = await deposit.getRequirements();

    // const signature = await requirements_1[0]?.sign(
    //   client,
    //   client.account.address,
    // );

    // const tx_1 = deposit.buildTx();
  });
});
