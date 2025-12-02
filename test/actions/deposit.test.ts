import { getChainAddresses } from "@morpho-org/blue-sdk";
import { isRequirementApproval, MorphoClient, vaultV2Deposit } from "../../src";
import { KeyrockUsdcVaultV2, Re7UsdtVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { test } from "../setup";

describe("Deposit VaultV2", () => {
  test("should create deposit bundle", async ({ client }) => {
    const morpho = new MorphoClient(client);

    const vault = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
    const deposit = await vault.deposit({
      userAddress: client.account.address,
      assets: 1000000000000000000n,
    });
    const requirements_1 = await deposit.getRequirements();
    const data = await vault.getData();
    const tx_1 = deposit.buildTx();

    const tx_2 = vaultV2Deposit({
      vault: {
        chainId: mainnet.id,
        address: KeyrockUsdcVaultV2.address,
        asset: KeyrockUsdcVaultV2.asset,
      },
      args: {
        assets: 1000000000000000000n,
        maxSharePrice: 1014972828025926n,
        recipient: client.account.address,
      },
    });

    expect(deposit).toBeDefined();
    expect(requirements_1).toBeDefined();
    expect(tx_1).toStrictEqual(tx_2);
    expect(data.asset).toStrictEqual(KeyrockUsdcVaultV2.asset);
    expect(data.address).toStrictEqual(KeyrockUsdcVaultV2.address);
  });

  test("should deposit 1K USDC in vaultV2", async ({ client }) => {
    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: KeyrockUsdcVaultV2.asset,
      amount: amount,
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
        const morpho = new MorphoClient(client);
        const vaultV2 = morpho.vaultV2(KeyrockUsdcVaultV2.address, mainnet.id);
        const deposit = await vaultV2.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const tx = deposit.buildTx();
        const requirements = await deposit.getRequirements();

        const approveTx = requirements[0];
        if (!approveTx) {
          throw new Error("Approve transaction not found");
        }
        if(!isRequirementApproval(approveTx)) {
          throw new Error("Approve transaction is not an approval transaction");
        }

        await client.sendTransaction(approveTx);
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
    expect(finalState.userSharesBalance).toEqual(985543619960501791635n);
  });

  test("should reset approval before approving for USDT flow", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);

    const amount = parseUnits("1000", 6);
    await client.deal({
      erc20: Re7UsdtVaultV2.asset,
      amount: amount,
    });

    const generalAdapter = getChainAddresses(mainnet.id).bundler3
      .generalAdapter1;

    await client.approve({
      address: Re7UsdtVaultV2.asset,
      args: [generalAdapter, 1n],
    });

    await testInvariants({
      client,
      params: {
        vaults: { Re7UsdtVaultV2 },
      },
      actionFn: async () => {
        const vault = morpho.vaultV2(Re7UsdtVaultV2.address, mainnet.id);
        const deposit = await vault.deposit({
          userAddress: client.account.address,
          assets: amount,
        });

        const requirements = await deposit.getRequirements();

        expect(requirements.length).toBe(2);
        expect(requirements[0]?.action.args.spender).toBe(generalAdapter);
        expect(requirements[0]?.action.args.amount).toBe(0n);
        expect(requirements[1]?.action.args.spender).toBe(generalAdapter);
        expect(requirements[1]?.action.args.amount).toBe(amount);

        const tx = deposit.buildTx();

        if (!requirements[0] || !requirements[1]) {
          throw new Error("Approval transactions not found");
        }

        if (!isRequirementApproval(requirements[0]) || !isRequirementApproval(requirements[1])) {
          throw new Error("Approve transaction is not an approval transaction");
        }

        await client.sendTransaction(requirements[0]);
        await client.sendTransaction(requirements[1]);
        await client.sendTransaction(tx);
      },
    });
  });
});
