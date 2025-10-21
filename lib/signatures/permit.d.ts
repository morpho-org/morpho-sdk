import { type Address, type ChainId, type Token } from "@morpho-org/blue-sdk";
import type { TypedDataDefinition } from "viem";
export interface PermitArgs {
    erc20: Token;
    owner: Address;
    spender: Address;
    allowance: bigint;
    nonce: bigint;
    deadline: bigint;
}
declare const permitTypes: {
    readonly Permit: readonly [{
        readonly name: "owner";
        readonly type: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly name: "value";
        readonly type: "uint256";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }];
};
/**
 * Permit signature for ERC20 tokens, following EIP-2612.
 * Docs: https://eips.ethereum.org/EIPS/eip-2612
 */
export declare const getPermitTypedData: ({ deadline, owner, nonce, spender, erc20, allowance }: PermitArgs, chainId: ChainId) => TypedDataDefinition<typeof permitTypes, "Permit">;
export interface DaiPermitArgs {
    owner: Address;
    spender: Address;
    allowance: bigint;
    nonce: bigint;
    deadline: bigint;
}
declare const daiPermitTypes: {
    readonly Permit: readonly [{
        readonly name: "holder";
        readonly type: "address";
    }, {
        readonly name: "spender";
        readonly type: "address";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly name: "expiry";
        readonly type: "uint256";
    }, {
        readonly name: "allowed";
        readonly type: "bool";
    }];
};
export declare const getDaiPermitTypedData: ({ deadline, owner, nonce, spender, allowance }: DaiPermitArgs, chainId: ChainId) => TypedDataDefinition<typeof daiPermitTypes, "Permit">;
export {};
