"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthorizationTypedData = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const authorizationTypes = {
    Authorization: [
        { name: "authorizer", type: "address" },
        { name: "authorized", type: "address" },
        { name: "isAuthorized", type: "bool" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
    ],
};
const getAuthorizationTypedData = ({ authorizer, authorized, isAuthorized, nonce, deadline }, chainId) => {
    return {
        domain: {
            chainId: chainId,
            verifyingContract: (0, blue_sdk_1.getChainAddresses)(chainId).morpho,
        },
        types: authorizationTypes,
        message: {
            authorizer,
            authorized,
            isAuthorized,
            nonce,
            deadline,
        },
        primaryType: "Authorization",
    };
};
exports.getAuthorizationTypedData = getAuthorizationTypedData;
