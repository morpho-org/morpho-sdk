import { MarketParams } from "@morpho-org/blue-sdk";

export const WstethUsdcMarket = new MarketParams({
  loanToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  collateralToken: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
  oracle: "0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
});
