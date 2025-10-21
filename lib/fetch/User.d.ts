import type { Address, Client } from "viem";
import { User } from "@morpho-org/blue-sdk";
import type { FetchParameters } from "../types";
export declare function fetchUser(address: Address, client: Client, parameters?: FetchParameters): Promise<User>;
