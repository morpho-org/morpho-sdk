import { Holding } from "@morpho-org/blue-sdk";
import { type Address, type Client } from "viem";
import type { DeploylessFetchParameters } from "../types";
export declare const optionalBoolean: readonly [undefined, false, true];
export declare function fetchHolding(user: Address, token: Address, client: Client, { deployless, ...parameters }?: DeploylessFetchParameters): Promise<Holding>;
