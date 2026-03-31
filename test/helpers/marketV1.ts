import {
  getChainAddresses,
  type MarketParams,
  MathLib,
} from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import type { AnvilTestClient } from "@morpho-org/test";
import { encodeFunctionData } from "viem";

export async function supplyCollateral(
  client: AnvilTestClient,
  chainId: number,
  WstethUsdcMarket: MarketParams,
  collateralAmount: bigint,
) {
  const { morpho } = getChainAddresses(chainId);
  await client.approve({
    address: WstethUsdcMarket.collateralToken,
    args: [morpho, MathLib.MAX_UINT_256],
  });
  await client.sendTransaction({
    to: morpho,
    data: encodeFunctionData({
      abi: blueAbi,
      functionName: "supplyCollateral",
      args: [WstethUsdcMarket, collateralAmount, client.account.address, "0x"],
    }),
    value: 0n,
  });
}
