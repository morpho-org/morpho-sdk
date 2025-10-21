import { type Address, type ChainId } from "@morpho-org/blue-sdk";
import type { TypedDataDefinition } from "viem";
export interface Permit2PermitArgs {
    erc20: Address;
    allowance: bigint;
    nonce: number;
    deadline: bigint;
    spender: Address;
    expiration?: number;
}
export interface Permit2TransferFromArgs {
    erc20: Address;
    allowance: bigint;
    spender: Address;
    nonce: bigint;
    deadline: bigint;
}
declare const permit2PermitTypes: {
    PermitSingle: {
        name: string;
        type: string;
    }[];
    PermitDetails: {
        name: string;
        type: string;
    }[];
};
export declare const getPermit2PermitTypedData: (args: Permit2PermitArgs, chainId: ChainId) => TypedDataDefinition<typeof permit2PermitTypes, "PermitSingle">;
declare const permit2TransferFromTypes: {
    PermitTransferFrom: {
        name: string;
        type: string;
    }[];
    TokenPermissions: {
        name: string;
        type: string;
    }[];
};
export declare const getPermit2TransferFromTypedData: (args: Permit2TransferFromArgs, chainId: ChainId) => TypedDataDefinition<typeof permit2TransferFromTypes, "PermitTransferFrom">;
export {};
