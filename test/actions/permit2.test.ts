import { addressesRegistry, MathLib } from "@morpho-org/blue-sdk";
import {
  isRequirementApproval,
  isRequirementSignature,
  MorphoClient,
} from "src";
import { Re7UsdtVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { isHex, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Permit2", () => {
  const { permit2 } = addressesRegistry[mainnet.id];

  test("should deposit USDT with permit2 with prior reset", async ({
    client,
  }) => {
    const amount = parseUnits("1000", 18);
    await client.deal({
      erc20: Re7UsdtVaultV2.asset,
      amount: amount,
    });

    await client.approve({
      address: Re7UsdtVaultV2.asset,
      args: [permit2, 1n],
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
        const morpho = new MorphoClient(client, { supportSignature: true });
        const vault = morpho.vaultV2(Re7UsdtVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const requirements = await deposit.getRequirements();
        console.log(requirements);

        // USDT may require two signature requirements (reset approval permit2 + approve permit2 + set allowance)
        expect(requirements.length).toBe(3);

        const approvalResetPermit2 = requirements[0];
        const approvalPermit2 = requirements[1];
        if (
          !isRequirementApproval(approvalResetPermit2) ||
          !isRequirementApproval(approvalPermit2)
        ) {
          throw new Error(
            "Approval requirement not found (reset permit2 or approve permit2)",
          );
        }

        expect(approvalResetPermit2.action.args.spender).toBe(permit2);
        expect(approvalResetPermit2.action.args.amount).toBe(0n);
        expect(approvalPermit2.action.args.spender).toBe(permit2);
        expect(approvalPermit2.action.args.amount).toBe(MathLib.MAX_UINT_160);

        await client.sendTransaction(approvalResetPermit2);
        await client.sendTransaction(approvalPermit2);

        const signaturePermit2 = requirements[2];

        if (!isRequirementSignature(signaturePermit2)) {
          throw new Error("Permit2 requirement not found");
        }

        const sig = await signaturePermit2.sign(client, client.account.address);

        expect(sig.owner).toEqual(client.account.address);
        expect(isHex(sig.signature)).toBe(true);
        expect(sig.signature.length).toBe(132);
        expect(sig.deadline).toBeGreaterThan(
          BigInt(Math.floor(Date.now() / 1000)),
        );

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

  test("should deposit USDT with permit2 with allowance 0", async ({
    client,
  }) => {
    const amount = parseUnits("1000", 18);
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
        const morpho = new MorphoClient(client, { supportSignature: true });
        const vault = morpho.vaultV2(Re7UsdtVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const requirements = await deposit.getRequirements();

        // USDT may require two signature requirements (approve permit2 + set allowance)
        expect(requirements.length).toBe(2);
        console.log("2", requirements);

        const approval = requirements[0];
        if (!isRequirementApproval(approval)) {
          throw new Error("Approval requirement not found");
        }

        await client.sendTransaction(approval);

        const permit2 = requirements[1];

        if (!isRequirementSignature(permit2)) {
          throw new Error("Permit2 requirement not found");
        }

        const sig = await permit2.sign(client, client.account.address);

        expect(sig.owner).toEqual(client.account.address);
        expect(isHex(sig.signature)).toBe(true);
        expect(sig.signature.length).toBe(132);
        expect(sig.deadline).toBeGreaterThan(
          BigInt(Math.floor(Date.now() / 1000)),
        );

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
