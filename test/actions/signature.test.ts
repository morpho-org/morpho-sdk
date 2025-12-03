import { isRequirementSignature, MorphoClient } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { isHex, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Signature", () => {
  test("should create deposit bundle with permit", async ({ client }) => {
    const morpho = new MorphoClient(client, true);

    const assets = parseUnits("10", 6);

    const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
    const deposit = await vault.deposit({
      userAddress: client.account.address,
      assets,
    });
    const requirements_1 = await deposit.getRequirements();

    if (!isRequirementSignature(requirements_1[0])) {
      throw new Error("Requirement is not a signature requirement");
    }

    const signatureArgs = await requirements_1[0].sign(
      client,
      client.account.address,
    );

    expect(signatureArgs.owner).toEqual(client.account.address);
    expect(isHex(signatureArgs.signature)).toBe(true);
    expect(signatureArgs.signature.length).toBe(132);
    expect(signatureArgs.deadline).toBeGreaterThan(
      BigInt(Math.floor(Date.now() / 1000)),
    );

    const tx_1 = deposit.buildTx();

    console.log(tx_1);

    await client.sendTransaction(tx_1);
  });
});
