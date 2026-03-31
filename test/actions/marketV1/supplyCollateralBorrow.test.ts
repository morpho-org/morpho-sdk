import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MarketParams,
  MathLib,
  ORACLE_PRICE_SCALE,
} from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import type { AnvilTestClient } from "@morpho-org/test";
import { type Address, encodeFunctionData, parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  BorrowExceedsSafeLtvError,
  ExcessiveSlippageToleranceError,
  MorphoClient,
  marketV1SupplyCollateralBorrow,
  NegativeNativeAmountError,
  NegativeSlippageToleranceError,
  NonPositiveAssetAmountError,
  NonPositiveBorrowAmountError,
  type RequirementSignature,
  ZeroCollateralAmountError,
} from "../../../src";
import { DEFAULT_LLTV_BUFFER } from "../../../src/helpers/constant";
import { WstethUsdcMarket } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { test } from "../../setup";

/**
 * Executes all requirements (approval txs, authorization txs, signatures).
 * Returns a permit/permit2 signature if one was encountered.
 */
async function executeRequirements(
  client: AnvilTestClient<typeof mainnet>,
  requirements: readonly unknown[],
): Promise<RequirementSignature | undefined> {
  let requirementSignature: RequirementSignature | undefined;

  for (const req of requirements) {
    if (
      req != null &&
      typeof req === "object" &&
      "sign" in req &&
      typeof req.sign === "function"
    ) {
      requirementSignature = await (
        req as {
          sign: (
            c: typeof client,
            addr: `0x${string}`,
          ) => Promise<RequirementSignature>;
        }
      ).sign(client, client.account.address);
    } else if (
      req != null &&
      typeof req === "object" &&
      "to" in req &&
      "data" in req
    ) {
      await client.sendTransaction(
        req as { to: `0x${string}`; data: `0x${string}`; value: bigint },
      );
    }
  }

  return requirementSignature;
}

describe("SupplyCollateralBorrowMarketV1", () => {
  const marketParams = new MarketParams(WstethUsdcMarket);

  describe("errors — action level (pure validation)", () => {
    const onBehalf: Address = "0x0000000000000000000000000000000000000001";
    const receiver: Address = "0x0000000000000000000000000000000000000001";

    test("should throw NonPositiveBorrowAmountError for zero borrowAmount", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: parseUnits("1", 18),
            borrowAmount: 0n,
            onBehalf,
            receiver,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(NonPositiveBorrowAmountError);
    });

    test("should throw NonPositiveAssetAmountError for negative ERC20 amount", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: -1n,
            borrowAmount: parseUnits("100", 6),
            onBehalf,
            receiver,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(NonPositiveAssetAmountError);
    });

    test("should throw ZeroCollateralAmountError when both amount and nativeAmount are zero", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: 0n,
            borrowAmount: parseUnits("100", 6),
            onBehalf,
            receiver,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(ZeroCollateralAmountError);
    });

    test("should throw NegativeNativeAmountError for negative nativeAmount", () => {
      expect(() =>
        marketV1SupplyCollateralBorrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: parseUnits("1", 18),
            nativeAmount: -1n,
            borrowAmount: parseUnits("100", 6),
            onBehalf,
            receiver,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(NegativeNativeAmountError);
    });
  });

  describe("errors — entity level (on-chain position)", () => {
    // These errors are thrown before the health check — a fresh empty position suffices.
    test("should throw NonPositiveBorrowAmountError for zero borrowAmount", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: parseUnits("1", 18),
          borrowAmount: 0n,
          accrualPosition,
        }),
      ).toThrow(NonPositiveBorrowAmountError);
    });

    test("should throw ZeroCollateralAmountError when collateral amount is zero", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: 0n,
          borrowAmount: parseUnits("100", 6),
          accrualPosition,
        }),
      ).toThrow(ZeroCollateralAmountError);
    });

    test("should throw NegativeNativeAmountError for negative nativeAmount", async ({
      client,
    }) => {
      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: parseUnits("1", 18),
          nativeAmount: -1n,
          borrowAmount: parseUnits("100", 6),
          accrualPosition,
        }),
      ).toThrow(NegativeNativeAmountError);
    });

    test("should throw BorrowExceedsSafeLtvError when borrow exceeds LTV buffer", async ({
      client,
    }) => {
      const collateralAmount = parseUnits("1", 18);
      await client.deal({
        erc20: WstethUsdcMarket.collateralToken,
        amount: collateralAmount,
      });

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      const { price } = accrualPosition.market;
      expect(price).toBeDefined();

      const collateralValueAfter = MathLib.mulDivDown(
        collateralAmount,
        price!,
        ORACLE_PRICE_SCALE,
      );
      const effectiveLltv = WstethUsdcMarket.lltv - DEFAULT_LLTV_BUFFER;
      const maxSafeBorrow = MathLib.wMulDown(
        collateralValueAfter,
        effectiveLltv,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          borrowAmount: maxSafeBorrow + 1n,
          accrualPosition,
        }),
      ).toThrow(BorrowExceedsSafeLtvError);
    });

    // Slippage errors are thrown after the health check — need a position that passes it.
    test("should throw NegativeSlippageToleranceError for negative slippage", async ({
      client,
    }) => {
      const collateralAmount = parseUnits("10", 18);
      await client.deal({
        erc20: WstethUsdcMarket.collateralToken,
        amount: collateralAmount,
      });

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          borrowAmount: parseUnits("100", 6),
          accrualPosition,
          slippageTolerance: -1n,
        }),
      ).toThrow(NegativeSlippageToleranceError);
    });

    test("should throw ExcessiveSlippageToleranceError for slippage above 10%", async ({
      client,
    }) => {
      const collateralAmount = parseUnits("10", 18);
      await client.deal({
        erc20: WstethUsdcMarket.collateralToken,
        amount: collateralAmount,
      });

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          borrowAmount: parseUnits("100", 6),
          accrualPosition,
          slippageTolerance: MathLib.WAD / 10n + 1n,
        }),
      ).toThrow(ExcessiveSlippageToleranceError);
    });
  });

  test("should compute minSharePrice from real market borrow state", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const { totalBorrowAssets, totalBorrowShares } = accrualPosition.market;

    const tx = market
      .supplyCollateralBorrow({
        userAddress: client.account.address,
        amount: collateralAmount,
        borrowAmount: parseUnits("100", 6),
        accrualPosition,
      })
      .buildTx();

    const expectedMinSharePrice =
      totalBorrowShares === 0n
        ? 0n
        : MathLib.mulDivDown(
            totalBorrowAssets,
            MathLib.wToRay(MathLib.WAD - DEFAULT_SLIPPAGE_TOLERANCE),
            totalBorrowShares,
          );

    expect(tx.action.args.minSharePrice).toBe(expectedMinSharePrice);
    expect(tx.action.args.minSharePrice).toBeGreaterThan(0n);
  });

  test("should atomic supply collateral and borrow with approval", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const {
      markets: {
        WstethUsdcMarket: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WstethUsdcMarket: marketParams },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        await executeRequirements(client, requirements);

        await client.sendTransaction(scb.buildTx());
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
    expect(finalState.position.borrowAssets).toBeGreaterThan(
      initialState.position.borrowAssets,
    );
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + collateralAmount,
    );
  });

  test("should atomic supply and borrow with permit2", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const {
      markets: {
        WstethUsdcMarket: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WstethUsdcMarket: marketParams },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client, {
          supportSignature: true,
        });
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        const requirementSignature = await executeRequirements(
          client,
          requirements,
        );

        await client.sendTransaction(scb.buildTx(requirementSignature));
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
    expect(finalState.morphoCollateralTokenBalance).toEqual(
      initialState.morphoCollateralTokenBalance + collateralAmount,
    );
  });

  test("should supply collateral and borrow round trip", async ({ client }) => {
    const { morpho } = getChainAddresses(mainnet.id);
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const {
      markets: {
        WstethUsdcMarket: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WstethUsdcMarket: marketParams },
      },
      actionFn: async () => {
        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        await executeRequirements(client, requirements);
        await client.sendTransaction(scb.buildTx());

        await client.approve({
          address: WstethUsdcMarket.loanToken,
          args: [morpho, MathLib.MAX_UINT_256],
        });

        const updatedPosition = await market.getPositionData(
          client.account.address,
        );

        await client.deal({
          erc20: WstethUsdcMarket.loanToken,
          amount: updatedPosition.borrowAssets + parseUnits("1", 6),
        });

        await client.sendTransaction({
          to: morpho,
          data: encodeFunctionData({
            abi: blueAbi,
            functionName: "repay",
            args: [
              WstethUsdcMarket,
              0n,
              updatedPosition.borrowShares,
              client.account.address,
              "0x",
            ],
          }),
          value: 0n,
        });

        await client.sendTransaction({
          to: morpho,
          data: encodeFunctionData({
            abi: blueAbi,
            functionName: "withdrawCollateral",
            args: [
              WstethUsdcMarket,
              collateralAmount,
              client.account.address,
              client.account.address,
            ],
          }),
          value: 0n,
        });
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral,
    );
  });

  test("should include setAuthorization tx in requirements when GeneralAdapter1 is not yet authorized", async ({
    client,
  }) => {
    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const scb = market.supplyCollateralBorrow({
      userAddress: client.account.address,
      amount: parseUnits("1", 18),
      borrowAmount: parseUnits("100", 6),
      accrualPosition,
    });

    const requirements = await scb.getRequirements();

    const authTx = requirements.find(
      (req) =>
        req != null &&
        "action" in req &&
        typeof req.action === "object" &&
        req.action !== null &&
        "type" in req.action &&
        req.action.type === "morphoAuthorization",
    );

    expect(authTx).toBeDefined();
  });

  test("should not include setAuthorization tx when GeneralAdapter1 is already authorized", async ({
    client,
  }) => {
    const {
      morpho,
      bundler3: { generalAdapter1 },
    } = getChainAddresses(mainnet.id);

    await client.sendTransaction({
      to: morpho,
      data: encodeFunctionData({
        abi: blueAbi,
        functionName: "setAuthorization",
        args: [generalAdapter1, true],
      }),
      value: 0n,
    });

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const scb = market.supplyCollateralBorrow({
      userAddress: client.account.address,
      amount: parseUnits("1", 18),
      borrowAmount: parseUnits("100", 6),
      accrualPosition,
    });

    const requirements = await scb.getRequirements();

    const authTx = requirements.find(
      (req) =>
        req != null &&
        "action" in req &&
        typeof req.action === "object" &&
        req.action !== null &&
        "type" in req.action &&
        req.action.type === "morphoAuthorization",
    );

    expect(authTx).toBeUndefined();
  });

  test("should execute full supplyCollateralBorrow after manual setAuthorization", async ({
    client,
  }) => {
    const collateralAmount = parseUnits("10", 18);
    const borrowAmount = parseUnits("1000", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });

    const {
      markets: {
        WstethUsdcMarket: { initialState, finalState },
      },
    } = await testInvariants({
      client,
      params: {
        markets: { WstethUsdcMarket: marketParams },
      },
      actionFn: async () => {
        const {
          morpho,
          bundler3: { generalAdapter1 },
        } = getChainAddresses(mainnet.id);

        await client.sendTransaction({
          to: morpho,
          data: encodeFunctionData({
            abi: blueAbi,
            functionName: "setAuthorization",
            args: [generalAdapter1, true],
          }),
          value: 0n,
        });

        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const scb = market.supplyCollateralBorrow({
          userAddress: client.account.address,
          amount: collateralAmount,
          accrualPosition,
          borrowAmount,
        });

        const requirements = await scb.getRequirements();
        await executeRequirements(client, requirements);
        await client.sendTransaction(scb.buildTx());
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
    expect(finalState.position.borrowAssets).toBeGreaterThan(
      initialState.position.borrowAssets,
    );
  });
});
