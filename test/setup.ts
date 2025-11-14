import { createViemTest } from "@morpho-org/test/vitest";
import { mainnet } from "viem/chains";
import { env } from "../src/config/env";

/**
 * This test will run on `mainnet`
 */
export const test = createViemTest(mainnet, {
  forkUrl: env().MAINNET_RPC_URL,
  chainId: mainnet.id,
  forkBlockNumber: 23633483n,
});
