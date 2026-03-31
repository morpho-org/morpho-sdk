import { getChainAddresses } from "@morpho-org/blue-sdk";
import { parseUnits } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect } from "vitest";
import { isRequirementApproval, MorphoClient } from "../../../src";
import { WethUsdsMarketV1 } from "../../fixtures/marketV1";
import { supplyCollateral } from "../../helpers/marketV1";
import { test } from "../../setup";

describe("AuthorizationMarketV1", () => {
  describe("authorization requirements", () => {
    test("should return a setAuthorization tx with correct properties when GeneralAdapter1 is not authorized", async ({
      client,
    }) => {
      const {
        morpho,
        bundler3: { generalAdapter1 },
      } = getChainAddresses(mainnet.id);

      await supplyCollateral(
        client,
        mainnet.id,
        WethUsdsMarketV1,
        parseUnits("10", 18),
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      const requirements = await market
        .borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 18),
          accrualPosition,
        })
        .getRequirements();

      expect(requirements).toHaveLength(1);
      const authTx = requirements[0]!;
      expect(authTx.action.type).toBe("morphoAuthorization");
      expect(authTx.action.args.authorized).toBe(generalAdapter1);
      expect(authTx.action.args.isAuthorized).toBe(true);
      expect(authTx.to).toBe(morpho);
    });

    test("should include setAuthorization in both borrow and supplyCollateralBorrow requirements", async ({
      client,
    }) => {
      await supplyCollateral(
        client,
        mainnet.id,
        WethUsdsMarketV1,
        parseUnits("10", 18),
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      const borrowRequirements = await market
        .borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 18),
          accrualPosition,
        })
        .getRequirements();

      const scbRequirements = await market
        .supplyCollateralBorrow({
          userAddress: client.account.address,
          nativeAmount: parseUnits("5", 18),
          borrowAmount: parseUnits("100", 18),
          accrualPosition,
        })
        .getRequirements();

      expect(borrowRequirements).toStrictEqual(scbRequirements);

      expect(borrowRequirements[0]!.action.type).toBe("morphoAuthorization");
      expect(scbRequirements[0]!.action.type).toBe("morphoAuthorization");
    });

    test("should return no setAuthorization requirement when GeneralAdapter1 is already authorized", async ({
      client,
    }) => {
      await supplyCollateral(
        client,
        mainnet.id,
        WethUsdsMarketV1,
        parseUnits("10", 18),
      );

      const morphoClient = new MorphoClient(client);
      const market = morphoClient.marketV1(WethUsdsMarketV1, mainnet.id);
      const accrualPosition = await market.getPositionData(
        client.account.address,
      );

      const requirementsBefore = await market
        .borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 18),
          accrualPosition,
        })
        .getRequirements();

      const requirementAuthorization = requirementsBefore[0];
      if (!isRequirementApproval(requirementAuthorization)) {
        throw new Error("Authorization requirement not found");
      }
      await client.sendTransaction(requirementAuthorization);

      const requirementsAfter = await market
        .borrow({
          userAddress: client.account.address,
          amount: parseUnits("100", 18),
          accrualPosition,
        })
        .getRequirements();

      expect(requirementsAfter).toHaveLength(0);
    });
  });
});
