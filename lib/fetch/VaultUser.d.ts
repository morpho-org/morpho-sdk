import { type Address, type Client } from "viem";
import { VaultUser } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare function fetchVaultUser(vault: Address, user: Address, client: Client, { deployless, ...parameters }?: DeploylessFetchParameters): Promise<VaultUser>;
