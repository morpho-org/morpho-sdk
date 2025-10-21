import { type Address, type Client } from "viem";
import { Token } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare const decodeBytes32String: (hexOrStr: string) => string;
export declare function fetchToken(address: Address, client: Client, { deployless, ...parameters }?: DeploylessFetchParameters): Promise<Token>;
