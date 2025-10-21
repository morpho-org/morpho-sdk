import type { Address, Client } from "viem";
import { type MarketId, VaultMarketAllocation } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare function fetchVaultMarketAllocation(vault: Address, marketId: MarketId, client: Client, parameters?: DeploylessFetchParameters): Promise<VaultMarketAllocation>;
