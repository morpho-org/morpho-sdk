import { type ChainId } from "@morpho-org/blue-sdk";
import type { TypedDataDefinition } from "viem";
export interface AuthorizationArgs {
    authorizer: string;
    authorized: string;
    isAuthorized: boolean;
    nonce: bigint;
    deadline: bigint;
}
declare const authorizationTypes: {
    Authorization: {
        name: string;
        type: string;
    }[];
};
export declare const getAuthorizationTypedData: ({ authorizer, authorized, isAuthorized, nonce, deadline }: AuthorizationArgs, chainId: ChainId) => TypedDataDefinition<typeof authorizationTypes, "Authorization">;
export {};
