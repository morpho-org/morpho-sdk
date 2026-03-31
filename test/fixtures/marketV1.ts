import { MarketParams } from "@morpho-org/blue-sdk";

export const CbbtcUsdcMarketV1 = new MarketParams({
  collateralToken: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
  loanToken: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  oracle: "0xA6D6950c9F177F1De7f7757FB33539e3Ec60182a",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
});

export const WethUsdsMarketV1 = new MarketParams({
  collateralToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  loanToken: "0xdC035D45d973E3EC169d2276DDab16f1e407384F",
  oracle: "0x76b2242ea5BE1FCBBF4206EA09601EA5aB22Af4d",
  irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  lltv: 860000000000000000n,
});
