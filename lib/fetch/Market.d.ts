import { type Client } from "viem";
import { Market, type MarketId } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare function fetchMarket(id: MarketId, client: Client, { deployless, ...parameters }?: DeploylessFetchParameters): Promise<Market>;
