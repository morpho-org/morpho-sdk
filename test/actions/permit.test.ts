import { addressesRegistry } from "@morpho-org/blue-sdk";
import { isRequirementSignature, MorphoClient } from "src";
import { KeyrockUsdcVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { createVaultV2 } from "test/helpers/vaultV2";
import { isHex, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Permit", () => {
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
        const morpho = new MorphoClient(client, { supportSignature: true });

        const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });
        const requirements_1 = await deposit.getRequirements();

        if (!isRequirementSignature(requirements_1[0])) {
          throw new Error("Requirement is not a signature requirement");
        }

        const requirementSignature = await requirements_1[0].sign(
          client,
          client.account.address,
        );

        expect(requirementSignature.args.owner).toEqual(client.account.address);
        expect(isHex(requirementSignature.args.signature)).toBe(true);
        expect(requirementSignature.args.signature.length).toBe(132);
        expect(requirementSignature.args.deadline).toBeGreaterThan(
          BigInt(Math.floor(Date.now() / 1000)),
        );

        const tx_1 = deposit.buildTx(requirementSignature);

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

  test("should deposit DAI with permit DAI", async ({ client }) => {
    const {
      dai,
      bundler3: { generalAdapter1 },
    } = addressesRegistry[mainnet.id];
    const amount = parseUnits("10", 18);

    await client.deal({
      erc20: dai,
      amount,
    });

    const { address } = await createVaultV2(client, dai, mainnet.id);
    const DaiVaultV2 = {
      address,
      asset: dai,
    } as const;

    const morpho = new MorphoClient(client, { supportSignature: true });
    const vault = morpho.vaultV2(address, mainnet.id);

    const {
      vaults: {
        DaiVaultV2: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        vaults: { DaiVaultV2 },
      },
      actionFn: async () => {
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const requirements = await deposit.getRequirements();

        expect(requirements.length).toBe(1);

        const permitDai = requirements[0];

        if (!isRequirementSignature(permitDai)) {
          throw new Error("Requirement is not a signature requirement");
        }

        expect(permitDai.action.type).toBe("permit");
        expect(permitDai.action.args.amount).toBe(amount);
        expect(permitDai.action.args.spender).toBe(generalAdapter1);

        const requirementSignature = await permitDai.sign(
          client,
          client.account.address,
        );

        expect(requirementSignature.args.owner).toEqual(client.account.address);
        expect(isHex(requirementSignature.args.signature)).toBe(true);
        expect(requirementSignature.args.signature.length).toBe(132);
        expect(requirementSignature.args.asset).toBe(dai);
        expect(requirementSignature.args.deadline).toBeGreaterThan(
          BigInt(Math.floor(Date.now() / 1000)),
        );

        const tx = deposit.buildTx(requirementSignature);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userAssetBalance).toEqual(
      initialState.userAssetBalance - amount,
    );
    expect(finalState.vaultBalance).toEqual(initialState.vaultBalance + amount);
    expect(finalState.userSharesBalance).toBeGreaterThan(
      initialState.userSharesBalance,
    );
  });
});
