import { getChainAddresses, type MarketParams } from "@morpho-org/blue-sdk";
import { blueAbi } from "@morpho-org/blue-sdk-viem";
import type { AnvilTestClient } from "@morpho-org/test";
import { encodeFunctionData } from "viem";

/**
 * Sets up a borrow position by supplying collateral and borrowing.
 * The user must already have collateral supplied to the market.
 */
export async function borrow(
  client: AnvilTestClient,
  chainId: number,
  market: MarketParams,
  borrowAmount: bigint,
) {
  const { morpho } = getChainAddresses(chainId);
  const {
    bundler3: { generalAdapter1 },
  } = getChainAddresses(chainId);

  // Authorize GA1 on Morpho
  await client.sendTransaction({
    to: morpho,
    data: encodeFunctionData({
      abi: blueAbi,
      functionName: "setAuthorization",
      args: [generalAdapter1, true],
    }),
    value: 0n,
  });

  // Borrow directly from Morpho
  await client.sendTransaction({
    to: morpho,
    data: encodeFunctionData({
      abi: blueAbi,
      functionName: "borrow",
      args: [
        market,
        borrowAmount,
        0n,
        client.account.address,
        client.account.address,
      ],
    }),
    value: 0n,
  });
}
