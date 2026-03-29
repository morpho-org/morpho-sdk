import type { MarketParamsInput } from "../../src/types";

/**
 * wstETH collateral / USDC loan — 86% LLTV
 * Market ID: 0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc
 * One of the most popular Morpho Blue markets on mainnet.
 */
export const WstethUsdcMarket = {
  loanToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  collateralToken: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  oracle: "0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
} as const satisfies MarketParamsInput;
