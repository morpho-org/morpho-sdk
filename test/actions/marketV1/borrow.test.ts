import {
  DEFAULT_SLIPPAGE_TOLERANCE,
  getChainAddresses,
  MathLib,
  ORACLE_PRICE_SCALE,
} from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import {
  BorrowExceedsSafeLtvError,
  ExcessiveSlippageToleranceError,
  MorphoClient,
  marketV1Borrow,
  NegativeSlippageToleranceError,
  NonPositiveBorrowAmountError,
} from "../../../src";
import { WstethUsdcMarket } from "../../fixtures/marketV1";
import { testInvariants } from "../../helpers/invariants";
import { supplyCollateral } from "../../helpers/marketV1";
import { test } from "../../setup";

/** Default LLTV buffer: 0.5% (matches src/helpers/constant.ts) */
const DEFAULT_LLTV_BUFFER = MathLib.WAD / 200n;

describe("BorrowMarketV1", () => {
  const {
    bundler3: { bundler3 },
  } = getChainAddresses(mainnet.id);

  test("should create borrow bundle", async ({ client }) => {
    const collateralAmount = parseUnits("10", 18);
    const amount = parseUnits("100", 6);

    await client.deal({
      erc20: WstethUsdcMarket.collateralToken,
      amount: collateralAmount,
    });
    await supplyCollateral(
      client,
      mainnet.id,
      WstethUsdcMarket,
      collateralAmount,
    );

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const borrow = market.borrow({
      userAddress: client.account.address,
      amount,
      accrualPosition,
    });

    const tx = borrow.buildTx();

    const directTx = marketV1Borrow({
      market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
      args: {
        amount,
        receiver: client.account.address,
        minSharePrice: 0n,
      },
    });

    expect(directTx).toStrictEqual(tx);

    expect(tx).toBeDefined();
    expect(tx.action.type).toBe("marketV1Borrow");
    expect(tx.action.args.amount).toBe(amount);
    expect(tx.to).toBe(bundler3);
    expect(tx.value).toBe(0n);
  });

  describe("errors", () => {
    test("should throw NonPositiveBorrowAmountError for zero borrow amount", ({
      client,
    }) => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: 0n,
            receiver: client.account.address,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(NonPositiveBorrowAmountError);
    });

    test("should throw NonPositiveBorrowAmountError for negative borrow amount", ({
      client,
    }) => {
      expect(() =>
        marketV1Borrow({
          market: { chainId: mainnet.id, marketParams: WstethUsdcMarket },
          args: {
            amount: -1n,
            receiver: client.account.address,
            minSharePrice: 0n,
          },
        }),
      ).toThrow(NonPositiveBorrowAmountError);
    });

    test("should throw NegativeSlippageToleranceError for negative slippage", async ({
      client,
    }) => {
      const collateralAmount = parseUnits("10", 18);
      await client.deal({
        erc20: WstethUsdcMarket.collateralToken,
        amount: collateralAmount,
      });
      await supplyCollateral(
        client,
        mainnet.id,
        WstethUsdcMarket,
        collateralAmount,
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 6),
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
      await supplyCollateral(
        client,
        mainnet.id,
        WstethUsdcMarket,
        collateralAmount,
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      expect(() =>
        market.borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 6),
          accrualPosition,
          slippageTolerance: MathLib.WAD / 10n + 1n,
        }),
      ).toThrow(ExcessiveSlippageToleranceError);
    });

    test("should throw BorrowExceedsSafeLtvError when borrow exceeds LTV buffer", async ({
      client,
    }) => {
      const collateralAmount = parseUnits("1", 18);
      await client.deal({
        erc20: WstethUsdcMarket.collateralToken,
        amount: collateralAmount,
      });
      await supplyCollateral(
        client,
        mainnet.id,
        WstethUsdcMarket,
        collateralAmount,
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      const { price } = accrualPosition.market;
      expect(price).toBeDefined();

      const collateralValue = MathLib.mulDivDown(
        accrualPosition.collateral,
        price!,
        ORACLE_PRICE_SCALE,
      );
      const effectiveLltv = WstethUsdcMarket.lltv - DEFAULT_LLTV_BUFFER;
      const maxSafeBorrow = MathLib.wMulDown(collateralValue, effectiveLltv);

      expect(() =>
        market.borrow({
          userAddress: client.account.address,
          amount: maxSafeBorrow + 1n,
          accrualPosition,
        }),
      ).toThrow(BorrowExceedsSafeLtvError);
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
    await supplyCollateral(
      client,
      mainnet.id,
      WstethUsdcMarket,
      collateralAmount,
    );

    const morphoClient = new MorphoClient(client);
    const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
    const accrualPosition = await market.getPositionData(
      client.account.address,
    );

    const { totalBorrowAssets, totalBorrowShares } = accrualPosition.market;

    const tx = market
      .borrow({
        userAddress: client.account.address,
        amount: parseUnits("100", 6),
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

  test("should supply collateral then borrow USDC", async ({ client }) => {
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
        markets: { WstethUsdcMarket },
      },
      actionFn: async () => {
        await supplyCollateral(
          client,
          mainnet.id,
          WstethUsdcMarket,
          collateralAmount,
        );

        const morphoClient = new MorphoClient(client);
        const market = morphoClient.marketV1(WstethUsdcMarket, mainnet.id);
        const accrualPosition = await market.getPositionData(
          client.account.address,
        );

        const borrow = market.borrow({
          userAddress: client.account.address,
          amount: borrowAmount,
          accrualPosition,
        });

        await client.sendTransaction(borrow.buildTx());
      },
    });

    expect(finalState.userCollateralTokenBalance).toEqual(
      initialState.userCollateralTokenBalance - collateralAmount,
    );
    expect(finalState.userLoanTokenBalance).toEqual(
      initialState.userLoanTokenBalance + borrowAmount,
    );
    expect(finalState.position.borrowAssets).toBeGreaterThan(
      initialState.position.borrowAssets,
    );
    expect(finalState.position.collateral).toEqual(
      initialState.position.collateral + collateralAmount,
    );
  });
});
