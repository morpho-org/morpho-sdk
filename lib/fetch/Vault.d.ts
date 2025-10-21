import { type Address, type Client } from "viem";
import { AccrualVault, Vault } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare function fetchVault(address: Address, client: Client, { deployless, ...parameters }?: DeploylessFetchParameters): Promise<Vault>;
export declare function fetchAccrualVault(address: Address, client: Client, parameters?: DeploylessFetchParameters): Promise<AccrualVault>;
