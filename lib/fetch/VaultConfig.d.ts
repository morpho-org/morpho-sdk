import type { Address, Client } from "viem";
import { VaultConfig } from "@morpho-org/blue-sdk";
import type { DeploylessFetchParameters } from "../types";
export declare function fetchVaultConfig(address: Address, client: Client, parameters?: DeploylessFetchParameters): Promise<VaultConfig>;
