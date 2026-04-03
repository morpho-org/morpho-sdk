import { getChainAddresses } from "@morpho-org/blue-sdk";
import { publicAllocatorAbi } from "@morpho-org/blue-sdk-viem";

import { type Address, encodeFunctionData, parseUnits } from "viem";
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
  ReallocationWithdrawalOnTargetMarketError,
} from "../../../src";
import type { VaultReallocation } from "../../../src/types";
import {
  CbbtcUsdcMarketV1,
  WbtcUsdcSourceMarket,
  WstethUsdcSourceMarket,
} from "../../fixtures/marketV1";
import { SteakhouseUsdcVaultV1 } from "../../fixtures/vaultV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { test } from "../../setup";

/** PublicAllocator admin for the Steakhouse vault at the fork block. */
const PA_ADMIN: Address = "0x9E9110cFd24cd851ea5bc73a27975B33E308f9e1";

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
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { CbbtcUsdcMarketV1, WbtcUsdcSourceMarket },
      },
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

    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );

    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );

    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(reallocationAmount + marketAccruedInterest);
  });
});

describe("Borrow with multiple source market withdrawals", () => {
  test("should borrow with reallocation withdrawing from two source markets", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("2000", 6);

    const reallocationAmount1 = parseUnits("1500", 6);
    const reallocationAmount2 = parseUnits("1000", 6);

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
            amount: reallocationAmount1,
          },
          {
            marketParams: WstethUsdcSourceMarket,
            amount: reallocationAmount2,
          },
        ],
      },
    ];

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
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
    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );

    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(
      reallocationAmount1 + reallocationAmount2 + marketAccruedInterest,
    );
  });
});

describe("Borrow with reallocation fee", () => {
  test("should borrow with non-zero reallocation fee", async ({ client }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("1000", 6);
    const reallocationFee = parseUnits("0.01", 18); // 0.01 ETH
    const reallocationAmount = parseUnits("2000", 6);

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
            amount: reallocationAmount,
          },
        ],
      },
    ];

    const publicAllocatorBalanceBefore = await client.getBalance({
      address: publicAllocator!,
    });

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
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
    expect(finalState.position.borrowAssets).toEqual(
      initialState.position.borrowAssets + borrowAmount + 1n,
    );

    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(reallocationAmount + marketAccruedInterest);

    const publicAllocatorBalanceAfter = await client.getBalance({
      address: publicAllocator!,
    });
    expect(publicAllocatorBalanceAfter).toEqual(
      publicAllocatorBalanceBefore + reallocationFee,
    );
  });
});

describe("SupplyCollateralBorrow with single vault reallocation", () => {
  test("should supply collateral and borrow with reallocation from one vault", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("1000", 6);
    const reallocationAmount = parseUnits("2000", 6);

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
            amount: reallocationAmount,
          },
        ],
      },
    ];

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
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

    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(reallocationAmount + marketAccruedInterest);
  });
});

describe("SupplyCollateralBorrow with multiple source market withdrawals", () => {
  test("should supply collateral and borrow with reallocation from two source markets", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("2000", 6);
    const reallocationAmount1 = parseUnits("1500", 6);
    const reallocationAmount2 = parseUnits("1000", 6);

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
            amount: reallocationAmount1,
          },
          {
            marketParams: WstethUsdcSourceMarket,
            amount: reallocationAmount2,
          },
        ],
      },
    ];

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
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
    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(
      reallocationAmount1 + reallocationAmount2 + marketAccruedInterest,
    );
  });
});

describe("SupplyCollateralBorrow with reallocation fee", () => {
  test("should supply collateral and borrow with non-zero reallocation fee", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 8);
    const borrowAmount = parseUnits("1000", 6);
    const reallocationFee = parseUnits("0.01", 18); // 0.01 ETH
    const reallocationAmount = parseUnits("2000", 6);

    await client.deal({
      erc20: CbbtcUsdcMarketV1.collateralToken,
      amount: collateralAmount,
    });

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
            amount: reallocationAmount,
          },
        ],
      },
    ];

    const publicAllocatorBalanceBefore = await client.getBalance({
      address: publicAllocator!,
    });

    const {
      markets: {
        CbbtcUsdcMarketV1: { initialState, finalState, marketAccruedInterest },
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

    expect(
      finalState.position.market.totalSupplyAssets -
        initialState.position.market.totalSupplyAssets,
    ).toEqual(reallocationAmount + marketAccruedInterest);

    const publicAllocatorBalanceAfter = await client.getBalance({
      address: publicAllocator!,
    });
    expect(publicAllocatorBalanceAfter).toEqual(
      publicAllocatorBalanceBefore + reallocationFee,
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

    test("should throw ReallocationWithdrawalOnTargetMarketError when withdrawal includes borrow market", () => {
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
                  {
                    marketParams: CbbtcUsdcMarketV1,
                    amount: parseUnits("100", 6),
                  },
                ],
              },
            ],
          },
        }),
      ).toThrow(ReallocationWithdrawalOnTargetMarketError);
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

    test("should throw ReallocationWithdrawalOnTargetMarketError when withdrawal includes borrow market", () => {
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
                  {
                    marketParams: CbbtcUsdcMarketV1,
                    amount: parseUnits("100", 6),
                  },
                ],
              },
            ],
          },
        }),
      ).toThrow(ReallocationWithdrawalOnTargetMarketError);
    });
  });
});
