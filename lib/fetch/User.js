"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUser = fetchUser;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
async function fetchUser(address, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const { morpho, bundler3: { generalAdapter1 }, } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    const [isBundlerAuthorized, morphoNonce] = await Promise.all([
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: morpho,
            abi: abis_1.blueAbi,
            functionName: "isAuthorized",
            args: [address, generalAdapter1],
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: morpho,
            abi: abis_1.blueAbi,
            functionName: "nonce",
            args: [address],
        }),
    ]);
    return new blue_sdk_1.User({
        address,
        isBundlerAuthorized,
        morphoNonce,
    });
}
