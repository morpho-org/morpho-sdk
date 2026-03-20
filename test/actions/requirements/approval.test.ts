import { getChainAddresses } from "@morpho-org/blue-sdk";
import { Re7UsdtVaultV2 } from "test/fixtures/vaultV2";
import { testInvariants } from "test/helpers/invariants";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { isRequirementApproval, MorphoClient } from "../../../src";
import { test } from "../../setup";

describe("Approval", () => {
  test("should approve once for USDT vaultV2 with allowance 0", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);

    const amount = parseUnits("1000", 18);
    await client.deal({
      erc20: Re7UsdtVaultV2.asset,
      amount: amount,
    });

    const generalAdapter = getChainAddresses(mainnet.id).bundler3
      .generalAdapter1;

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

        expect(requirements.length).toBe(1);
        expect(requirements[0]?.action.args.spender).toBe(generalAdapter);
        expect(requirements[0]?.action.args.amount).toBe(amount);

        if (!isRequirementApproval(requirements[0])) {
          throw new Error("Approve transaction is not an approval transaction");
        }

        await client.sendTransaction(requirements[0]);

        const tx = deposit.buildTx();

        await client.sendTransaction(tx);
      },
    });
  });

  test("should reset approval before approving for USDT flow", async ({
    client,
  }) => {
    const morpho = new MorphoClient(client);

    const amount = parseUnits("1000", 18);
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

        if (
          !isRequirementApproval(requirements[0]) ||
          !isRequirementApproval(requirements[1])
        ) {
          throw new Error("Approve transaction is not an approval transaction");
        }

        await client.sendTransaction(requirements[0]);
        await client.sendTransaction(requirements[1]);

        const tx = deposit.buildTx();

        await client.sendTransaction(tx);
      },
    });
  });
});
