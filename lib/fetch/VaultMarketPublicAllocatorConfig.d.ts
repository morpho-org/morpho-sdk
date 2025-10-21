import type { Address, Client } from "viem";
import { type MarketId, VaultMarketPublicAllocatorConfig } from "@morpho-org/blue-sdk";
import type { FetchParameters } from "../types";
export declare function fetchVaultMarketPublicAllocatorConfig(vault: Address, marketId: MarketId, client: Client, parameters?: FetchParameters): Promise<VaultMarketPublicAllocatorConfig | undefined>;
