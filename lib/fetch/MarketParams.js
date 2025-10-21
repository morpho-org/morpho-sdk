"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarketParams = fetchMarketParams;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const utils_1 = require("../utils");
async function fetchMarketParams(id, client, { chainId } = {}) {
    let config = (0, blue_sdk_1._try)(() => blue_sdk_1.MarketParams.get(id), blue_sdk_1.UnknownMarketParamsError);
    if (!config) {
        chainId ??= await (0, actions_1.getChainId)(client);
        const { morpho } = (0, blue_sdk_1.getChainAddresses)(chainId);
        config = new blue_sdk_1.MarketParams(await (0, utils_1.readContractRestructured)(client, {
            address: morpho,
            abi: abis_1.blueAbi,
            functionName: "idToMarketParams",
            args: [id],
            // Always fetch at latest block because config is immutable.
            blockTag: "latest",
        }));
    }
    return config;
}
