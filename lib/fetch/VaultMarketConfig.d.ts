import type { Address, Client } from "viem";
import { type MarketId, VaultMarketConfig } from "@morpho-org/blue-sdk";
import type { FetchParameters } from "../types";
export declare function fetchVaultMarketConfig(vault: Address, marketId: MarketId, client: Client, parameters?: FetchParameters): Promise<VaultMarketConfig>;
