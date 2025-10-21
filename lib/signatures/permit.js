"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDaiPermitTypedData = exports.getPermitTypedData = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const permitTypes = {
    Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
};
/**
 * Permit signature for ERC20 tokens, following EIP-2612.
 * Docs: https://eips.ethereum.org/EIPS/eip-2612
 */
const getPermitTypedData = ({ deadline, owner, nonce, spender, erc20, allowance }, chainId) => {
    const { usdc } = (0, blue_sdk_1.getChainAddresses)(chainId);
    const domain = erc20.eip5267Domain?.eip712Domain ?? {
        name: erc20.name,
        version: erc20.address === usdc ? "2" : "1",
        chainId,
        verifyingContract: erc20.address,
    };
    return {
        domain,
        types: permitTypes,
        message: {
            owner,
            spender,
            value: allowance,
            nonce,
            deadline,
        },
        primaryType: "Permit",
    };
};
exports.getPermitTypedData = getPermitTypedData;
const daiPermitTypes = {
    Permit: [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
    ],
};
const getDaiPermitTypedData = ({ deadline, owner, nonce, spender, allowance }, chainId) => {
    const { dai } = (0, blue_sdk_1.getChainAddresses)(chainId);
    const domain = {
        name: "Dai Stablecoin",
        version: "1",
        chainId,
        verifyingContract: dai,
    };
    return {
        domain,
        types: daiPermitTypes,
        message: {
            holder: owner,
            spender,
            allowed: allowance > 0n,
            nonce,
            expiry: deadline,
        },
        primaryType: "Permit",
    };
};
exports.getDaiPermitTypedData = getDaiPermitTypedData;
