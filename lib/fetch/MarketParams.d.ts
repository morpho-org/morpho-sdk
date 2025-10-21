import { type MarketId, MarketParams } from "@morpho-org/blue-sdk";
import type { Client } from "viem";
import type { FetchParameters } from "../types";
export declare function fetchMarketParams(id: MarketId, client: Client, { chainId }?: Pick<FetchParameters, "chainId">): Promise<MarketParams>;
