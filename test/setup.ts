import { createViemTest } from "@morpho-org/test/vitest";
import { mainnet } from "viem/chains";

/**
 * This test will run on `mainnet`
 */
export const test = createViemTest(mainnet, {
  forkUrl: process.env.MAINNET_RPC_URL,
  forkBlockNumber: 21_950_000,
});
