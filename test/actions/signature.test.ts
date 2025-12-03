import { isRequirementSignature, MorphoClient } from "src";
import { KeyrockUsdcVaultV2, Re7UsdtVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { isHex, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Signature", () => {
  test("should deposit USDC with permit version 2", async ({ client }) => {
    const amount = parseUnits("10", 6);

    await client.deal({
      erc20: KeyrockUsdcVaultV2.asset,
      amount,
    });

    const {
      vaults: {
        KeyrockUsdcVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { KeyrockUsdcVaultV2 },
      },
      actionFn: async () => {
        const morpho = new MorphoClient(client, true);

        const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
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

        await client.sendTransaction(tx_1);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount,
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount,
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance,
    );
  });

  test("should deposit USDT with permit and prior reset", async ({ client }) => {
    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: Re7UsdtVaultV2.asset,
      amount: amount,
    });

    const {
      vaults: {
        Re7UsdtVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { Re7UsdtVaultV2 },
      },
      actionFn: async () => {
        // Pass supportSignature: true
        const morpho = new MorphoClient(client, true);
        const vault = morpho.vaultV2(Re7UsdtVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const requirements = await deposit.getRequirements();

        // USDT may require two signature requirements (reset + set)
        expect(requirements.length).toBe(2);

        for (const [index, req] of requirements.entries()) {
          if (!isRequirementSignature(req)) {
            throw new Error(`Requirement at index ${index} is not a signature requirement`);
          }
          
          const sig = await req.sign(client, client.account.address);

          expect(sig.owner).toEqual(client.account.address);
          expect(isHex(sig.signature)).toBe(true);
          expect(sig.signature.length).toBe(132);
          expect(sig.deadline).toBeGreaterThan(BigInt(Math.floor(Date.now() / 1000)));
        }

        const tx = deposit.buildTx();

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount,
    );
    expect(finalState.morphoAssetBalance).toEqual(
      initialState.morphoAssetBalance + amount,
    );
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance,
    );
  });
});
