import { fetchMarket } from "@morpho-org/blue-sdk-viem";

import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { isRequirementAuthorization, MorphoClient } from "../../../src";
import { CbbtcUsdcMarketV1 } from "../../fixtures/marketV1";
import { SteakhouseUsdcVaultV1 } from "../../fixtures/vaultV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { test } from "../../setup";

describe("BorrowWithSharedLiquidity", () => {
  test("should borrow with shared liquidity reallocation", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8); // cbBTC has 8 decimals
    const borrowAmount = parseUnits("1000", 6); // USDC has 6 decimals

    // Supply collateral to establish a position
    await supplyCollateral(
      client,
      mainnet.id,
      CbbtcUsdcMarketV1,
      collateralAmount,
    );

    // Capture market supply BEFORE reallocation
    const marketBefore = await fetchMarket(CbbtcUsdcMarketV1.id, client, {
      chainId: mainnet.id,
    });
    const supplyBefore = marketBefore.totalSupplyAssets;

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: { markets: { CbbtcUsdcMarketV1 } },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client, {
          sharedLiquidity: {
            maxWithdrawalUtilization: 920000000000000000n,
          },
        });
        const market = morphoClient.marketV1(CbbtcUsdcMarketV1, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        // Fetch shared liquidity data from the Steakhouse USDC vault
        const sharedLiquidityData = await market.getSharedLiquidityData({
          supplyingVaults: [SteakhouseUsdcVaultV1.address],
        });

        // Borrow with shared liquidity — reallocations computed internally
        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
          sharedLiquidity: sharedLiquidityData,
        });

        // Execute authorization requirement
        const requirements = await borrow.getRequirements();
        const authorization = requirements[0];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }
        await client.sendTransaction(authorization);

        // Build and send borrow tx (includes reallocateTo + morphoBorrow)
        const tx = borrow.buildTx();

        // If there's a reallocation fee, set ETH balance to cover it
        if (tx.value > 0n) {
          await client.setBalance({
            address: client.account.address,
            value: tx.value + parseUnits("1", 18),
          });
        }

        await client.sendTransaction(tx);
      },
    });

    // The borrow should have succeeded — user received loan tokens
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );

    // Position should reflect the borrowed amount
    expect(finalState.position.borrowAssets).toBeGreaterThanOrEqual(
      initialState.position.borrowAssets + borrowAmount,
    );

    // Market supply should have increased due to reallocation
    // (liquidity was moved from other markets into this one)
    const marketAfter = await fetchMarket(CbbtcUsdcMarketV1.id, client, {
      chainId: mainnet.id,
    });

    // Total supply after = supplyBefore + reallocated - borrowed
    // With reallocation, supply should be greater than supplyBefore - borrowAmount
    expect(marketAfter.totalSupplyAssets).toBeGreaterThan(
      supplyBefore - borrowAmount,
    );
  });

  test("should borrow without reallocation when sharedLiquidity is not provided", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("100", 6);

    await supplyCollateral(
      client,
      mainnet.id,
      CbbtcUsdcMarketV1,
      collateralAmount,
    );

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: { markets: { CbbtcUsdcMarketV1 } },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(CbbtcUsdcMarketV1, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        // Borrow WITHOUT shared liquidity — should work as before
        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
        });

        const requirements = await borrow.getRequirements();
        const authorization = requirements[0];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }
        await client.sendTransaction(authorization);

        const tx = borrow.buildTx();
        // No reallocation = value should be 0
        expect(tx.value).toEqual(0n);
        // Action should not have reallocationFee
        expect(tx.action.args.reallocationFee).toBeUndefined();

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );
  });
});
