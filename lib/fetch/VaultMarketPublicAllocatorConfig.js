"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVaultMarketPublicAllocatorConfig = fetchVaultMarketPublicAllocatorConfig;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
async function fetchVaultMarketPublicAllocatorConfig(vault, marketId, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const { publicAllocator } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    if (publicAllocator == null)
        return;
    const [maxIn, maxOut] = await (0, actions_1.readContract)(client, {
        ...parameters,
        address: publicAllocator,
        abi: abis_1.publicAllocatorAbi,
        functionName: "flowCaps",
        args: [vault, marketId],
    });
    return new blue_sdk_1.VaultMarketPublicAllocatorConfig({
        vault,
        marketId,
        maxIn,
        maxOut,
    });
}
