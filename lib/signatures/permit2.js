"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermit2TransferFromTypedData = exports.getPermit2PermitTypedData = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const permit2PermitTypes = {
    PermitSingle: [
        { name: "details", type: "PermitDetails" },
        { name: "spender", type: "address" },
        { name: "sigDeadline", type: "uint256" },
    ],
    PermitDetails: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint160" },
        { name: "expiration", type: "uint48" },
        { name: "nonce", type: "uint48" },
    ],
};
const getPermit2PermitTypedData = (args, chainId) => {
    return {
        domain: {
            name: "Permit2",
            chainId: chainId,
            verifyingContract: (0, blue_sdk_1.getChainAddresses)(chainId).permit2,
        },
        types: permit2PermitTypes,
        message: {
            details: {
                token: args.erc20,
                amount: blue_sdk_1.MathLib.min(args.allowance, blue_sdk_1.MathLib.MAX_UINT_160),
                // Use an unlimited expiration because it most
                // closely mimics how a standard approval works.
                expiration: blue_sdk_1.MathLib.min(args.expiration ?? blue_sdk_1.MathLib.MAX_UINT_48, blue_sdk_1.MathLib.MAX_UINT_48),
                nonce: args.nonce,
            },
            spender: args.spender,
            sigDeadline: args.deadline,
        },
        primaryType: "PermitSingle",
    };
};
exports.getPermit2PermitTypedData = getPermit2PermitTypedData;
const permit2TransferFromTypes = {
    PermitTransferFrom: [
        { name: "permitted", type: "TokenPermissions" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
    TokenPermissions: [
        { name: "token", type: "address" },
        { name: "amount", type: "uint256" },
    ],
};
const getPermit2TransferFromTypedData = (args, chainId) => {
    return {
        domain: {
            name: "Permit2",
            chainId,
            verifyingContract: (0, blue_sdk_1.getChainAddresses)(chainId).permit2,
        },
        types: permit2TransferFromTypes,
        message: {
            permitted: {
                token: args.erc20,
                amount: blue_sdk_1.MathLib.min(args.allowance, blue_sdk_1.MathLib.MAX_UINT_160),
            },
            spender: args.spender,
            nonce: args.nonce,
            deadline: args.deadline,
        },
        primaryType: "PermitTransferFrom",
    };
};
exports.getPermit2TransferFromTypedData = getPermit2TransferFromTypedData;
