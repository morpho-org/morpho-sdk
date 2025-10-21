"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVaultConfig = fetchVaultConfig;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const Token_1 = require("./Token");
async function fetchVaultConfig(address, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const [token, asset, decimalsOffset] = await Promise.all([
        (0, Token_1.fetchToken)(address, client, parameters), // TODO: avoid fetching decimals
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "asset",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "DECIMALS_OFFSET",
        }),
    ]);
    return new blue_sdk_1.VaultConfig({
        ...token,
        asset,
        decimalsOffset: BigInt(decimalsOffset),
    });
}
