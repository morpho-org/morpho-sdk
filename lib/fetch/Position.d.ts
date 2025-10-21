import { AccrualPosition, type MarketId, Position, PreLiquidationParams, PreLiquidationPosition } from "@morpho-org/blue-sdk";
import type { Address, Client } from "viem";
import type { DeploylessFetchParameters, FetchParameters } from "../types";
export declare function fetchPosition(user: Address, marketId: MarketId, client: Client, parameters?: FetchParameters): Promise<Position>;
export declare function fetchPreLiquidationParams(preLiquidation: Address, client: Client, parameters?: DeploylessFetchParameters): Promise<PreLiquidationParams>;
export declare function fetchAccrualPosition(user: Address, marketId: MarketId, client: Client, parameters?: DeploylessFetchParameters): Promise<AccrualPosition>;
export declare function fetchPreLiquidationPosition(user: Address, marketId: MarketId, preLiquidation: Address, client: Client, parameters?: DeploylessFetchParameters): Promise<PreLiquidationPosition>;
