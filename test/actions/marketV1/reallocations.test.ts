import { getChainAddresses, MarketParams } from "@morpho-org/blue-sdk";
import { fetchMarket, publicAllocatorAbi } from "@morpho-org/blue-sdk-viem";

import { encodeFunctionData, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  EmptyReallocationWithdrawalsError,
  isRequirementApproval,
  isRequirementAuthorization,
  MorphoClient,
  marketV1Borrow,
  marketV1SupplyCollateralBorrow,
  NegativeReallocationFeeError,
  NonPositiveReallocationAmountError,
} from "../../../src";
import type { VaultReallocation } from "../../../src/types";
import { CbbtcUsdcMarketV1 } from "../../fixtures/marketV1";
import { SteakhouseUsdcVaultV1 } from "../../fixtures/vaultV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { test } from "../../setup";

/** WBTC/USDC market — source for Steakhouse vault reallocations. */
const WbtcUsdcSourceMarket = new MarketParams({
  loanToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  collateralToken: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
  oracle: "0xDddd770BADd886dF3864029e4B377B5F6a2B6b83",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
});

/** wstETH/USDC market — second source for multi-withdrawal tests. */
const WstethUsdcSourceMarket = new MarketParams({
  loanToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  collateralToken: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  oracle: "0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
});

/** PublicAllocator admin for the Steakhouse vault at the fork block. */
const PA_ADMIN = "0x9E9110cFd24cd851ea5bc73a27975B33E308f9e1" as const;

describe("Borrow with single vault reallocation (e2e)", () => {
  test("should borrow with reallocation from one vault", async ({ client }) => {
    const collateralAmount = parseUnits("10", 8); // cbBTC 8 decimals
    const borrowAmount = parseUnits("1000", 6); // USDC 6 decimals
    const reallocationAmount = parseUnits("2000", 6);

    await supplyCollateral(
      client,
      mainnet.id,
      CbbtcUsdcMarketV1,
      collateralAmount,
    );

    const marketBefore = await fetchMarket(CbbtcUsdcMarketV1.id, client, {
      chainId: mainnet.id,
    });
    const supplyBefore = marketBefore.totalSupplyAssets;

    const reallocations: readonly VaultReallocation[] = [
      {
        vault: SteakhouseUsdcVaultV1.address,
        fee: 0n,
        withdrawals: [
          {
            marketParams: WbtcUsdcSourceMarket,
            amount: reallocationAmount,
          },
        ],
      },
    ];

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

        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
          reallocations,
        });

        const requirements = await borrow.getRequirements();
        const authorization = requirements[0];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }
        await client.sendTransaction(authorization);

        const tx = borrow.buildTx();
        expect(tx.value).toBe(0n);
        expect(tx.action.args.reallocationFee).toBe(0n);

        await client.sendTransaction(tx);
      },
    });

    // User received borrowed USDC
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );

    // Position reflects borrow
    expect(finalState.position.borrowAssets).toBeGreaterThanOrEqual(
      initialState.position.borrowAssets + borrowAmount,
    );

    // Market supply increased from reallocation
    const marketAfter = await fetchMarket(CbbtcUsdcMarketV1.id, client, {
      chainId: mainnet.id,
    });
    expect(marketAfter.totalSupplyAssets).toBeGreaterThan(
      supplyBefore - borrowAmount,
    );
  });
});

describe("Borrow with multiple source market withdrawals (e2e)", () => {
  test("should borrow with reallocation withdrawing from two source markets", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("2000", 6);

    await supplyCollateral(
      client,
      mainnet.id,
      CbbtcUsdcMarketV1,
      collateralAmount,
    );

    const reallocations: readonly VaultReallocation[] = [
      {
        vault: SteakhouseUsdcVaultV1.address,
        fee: 0n,
        withdrawals: [
          {
            marketParams: WbtcUsdcSourceMarket,
            amount: parseUnits("1500", 6),
          },
          {
            marketParams: WstethUsdcSourceMarket,
            amount: parseUnits("1000", 6),
          },
        ],
      },
    ];

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

        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
          reallocations,
        });

        const requirements = await borrow.getRequirements();
        const authorization = requirements[0];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }
        await client.sendTransaction(authorization);

        const tx = borrow.buildTx();
        expect(tx.value).toBe(0n);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.borrowAssets).toBeGreaterThanOrEqual(
      initialState.position.borrowAssets + borrowAmount,
    );
  });
});

describe("Borrow with reallocation fee (e2e)", () => {
  test("should borrow with non-zero reallocation fee", async ({ client }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("1000", 6);
    const reallocationFee = parseUnits("0.01", 18); // 0.01 ETH

    await supplyCollateral(
      client,
      mainnet.id,
      CbbtcUsdcMarketV1,
      collateralAmount,
    );

    // Impersonate the PA admin to set a fee on the Steakhouse vault
    const { publicAllocator } = getChainAddresses(mainnet.id);
    await client.impersonateAccount({ address: PA_ADMIN });
    await client.setBalance({
      address: PA_ADMIN,
      value: parseUnits("1", 18),
    });
    await client.sendTransaction({
      account: PA_ADMIN,
      to: publicAllocator,
      data: encodeFunctionData({
        abi: publicAllocatorAbi,
        functionName: "setFee",
        args: [SteakhouseUsdcVaultV1.address, reallocationFee],
      }),
      value: 0n,
    });
    await client.stopImpersonatingAccount({ address: PA_ADMIN });

    const reallocations: readonly VaultReallocation[] = [
      {
        vault: SteakhouseUsdcVaultV1.address,
        fee: reallocationFee,
        withdrawals: [
          {
            marketParams: WbtcUsdcSourceMarket,
            amount: parseUnits("2000", 6),
          },
        ],
      },
    ];

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

        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
          reallocations,
        });

        const requirements = await borrow.getRequirements();
        const authorization = requirements[0];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }
        await client.sendTransaction(authorization);

        const tx = borrow.buildTx();
        expect(tx.value).toBe(reallocationFee);
        expect(tx.action.args.reallocationFee).toBe(reallocationFee);

        // Set ETH balance to cover the fee
        await client.setBalance({
          address: client.account.address,
          value: reallocationFee + parseUnits("1", 18),
        });

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.borrowAssets).toBeGreaterThanOrEqual(
      initialState.position.borrowAssets + borrowAmount,
    );
  });
});

describe("SupplyCollateralBorrow with single vault reallocation (e2e)", () => {
  test("should supply collateral and borrow with reallocation from one vault", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: CbbtcUsdcMarketV1.collateralToken,
      amount: collateralAmount,
    });

    const reallocations: readonly VaultReallocation[] = [
      {
        vault: SteakhouseUsdcVaultV1.address,
        fee: 0n,
        withdrawals: [
          {
            marketParams: WbtcUsdcSourceMarket,
            amount: parseUnits("2000", 6),
          },
        ],
      },
    ];

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

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          borrowAmount,
          accrualPosition,
          reallocations,
        });

        const requirements = await scb.getRequirements();
        const approval = requirements[0];
        if (!isRequirementApproval(approval)) {
          throw new Error("Approval requirement not found");
        }
        const authorization = requirements[1];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }

        await client.sendTransaction(approval);
        await client.sendTransaction(authorization);

        const tx = scb.buildTx();
        expect(tx.value).toBe(0n);
        expect(tx.action.args.reallocationFee).toBe(0n);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );
  });
});

describe("SupplyCollateralBorrow with multiple source market withdrawals (e2e)", () => {
  test("should supply collateral and borrow with reallocation from two source markets", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("2000", 6);

    await client.deal({
      erc20: CbbtcUsdcMarketV1.collateralToken,
      amount: collateralAmount,
    });

    const reallocations: readonly VaultReallocation[] = [
      {
        vault: SteakhouseUsdcVaultV1.address,
        fee: 0n,
        withdrawals: [
          {
            marketParams: WbtcUsdcSourceMarket,
            amount: parseUnits("1500", 6),
          },
          {
            marketParams: WstethUsdcSourceMarket,
            amount: parseUnits("1000", 6),
          },
        ],
      },
    ];

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

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          borrowAmount,
          accrualPosition,
          reallocations,
        });

        const requirements = await scb.getRequirements();
        const approval = requirements[0];
        if (!isRequirementApproval(approval)) {
          throw new Error("Approval requirement not found");
        }
        const authorization = requirements[1];
        if (!isRequirementAuthorization(authorization)) {
          throw new Error("Authorization requirement not found");
        }

        await client.sendTransaction(approval);
        await client.sendTransaction(authorization);

        const tx = scb.buildTx();
        expect(tx.value).toBe(0n);

        await client.sendTransaction(tx);
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );
  });
});

describe("Reallocation validation errors", () => {
  describe("marketV1Borrow", () => {
    test("should throw NegativeReallocationFeeError for negative fee", () => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("100", 6),
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: -1n,
                withdrawals: [
                  {
                    marketParams: WbtcUsdcSourceMarket,
                    amount: parseUnits("100", 6),
                  },
                ],
              },
            ],
          },
        }),
      ).toThrow(NegativeReallocationFeeError);
    });

    test("should throw EmptyReallocationWithdrawalsError for empty withdrawals", () => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("100", 6),
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [],
              },
            ],
          },
        }),
      ).toThrow(EmptyReallocationWithdrawalsError);
    });

    test("should throw NonPositiveReallocationAmountError for zero withdrawal amount", () => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("100", 6),
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [
                  { marketParams: WbtcUsdcSourceMarket, amount: 0n },
                ],
              },
            ],
          },
        }),
      ).toThrow(NonPositiveReallocationAmountError);
    });

    test("should throw NonPositiveReallocationAmountError for negative withdrawal amount", () => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("100", 6),
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [
                  { marketParams: WbtcUsdcSourceMarket, amount: -1n },
                ],
              },
            ],
          },
        }),
      ).toThrow(NonPositiveReallocationAmountError);
    });
  });

  describe("marketV1SupplyCollateralBorrow", () => {
    test("should throw NegativeReallocationFeeError for negative fee", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("1", 8),
            borrowAmount: parseUnits("100", 6),
            onBehalf: "0x000000000000000000000000000000000000dEaD",
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: -1n,
                withdrawals: [
                  {
                    marketParams: WbtcUsdcSourceMarket,
                    amount: parseUnits("100", 6),
                  },
                ],
              },
            ],
          },
        }),
      ).toThrow(NegativeReallocationFeeError);
    });

    test("should throw EmptyReallocationWithdrawalsError for empty withdrawals", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("1", 8),
            borrowAmount: parseUnits("100", 6),
            onBehalf: "0x000000000000000000000000000000000000dEaD",
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [],
              },
            ],
          },
        }),
      ).toThrow(EmptyReallocationWithdrawalsError);
    });

    test("should throw NonPositiveReallocationAmountError for zero withdrawal amount", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("1", 8),
            borrowAmount: parseUnits("100", 6),
            onBehalf: "0x000000000000000000000000000000000000dEaD",
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [
                  { marketParams: WbtcUsdcSourceMarket, amount: 0n },
                ],
              },
            ],
          },
        }),
      ).toThrow(NonPositiveReallocationAmountError);
    });

    test("should throw NonPositiveReallocationAmountError for negative withdrawal amount", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: CbbtcUsdcMarketV1 },
          args: {
            amount: parseUnits("1", 8),
            borrowAmount: parseUnits("100", 6),
            onBehalf: "0x000000000000000000000000000000000000dEaD",
            receiver: "0x000000000000000000000000000000000000dEaD",
            minSharePrice: 1n,
            reallocations: [
              {
                vault: SteakhouseUsdcVaultV1.address,
                fee: 0n,
                withdrawals: [
                  { marketParams: WbtcUsdcSourceMarket, amount: -1n },
                ],
              },
            ],
          },
        }),
      ).toThrow(NonPositiveReallocationAmountError);
    });
  });
});
