"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVaultMarketConfig = fetchVaultMarketConfig;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const VaultMarketPublicAllocatorConfig_1 = require("./VaultMarketPublicAllocatorConfig");
async function fetchVaultMarketConfig(vault, marketId, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const [[cap, enabled, removableAt], pendingCap, publicAllocatorConfig] = await Promise.all([
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: vault,
            abi: abis_1.metaMorphoAbi,
            functionName: "config",
            args: [marketId],
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: vault,
            abi: abis_1.metaMorphoAbi,
            functionName: "pendingCap",
            args: [marketId],
        }).then(([value, validAt]) => ({ value, validAt })),
        (0, VaultMarketPublicAllocatorConfig_1.fetchVaultMarketPublicAllocatorConfig)(vault, marketId, client, parameters),
    ]);
    return new blue_sdk_1.VaultMarketConfig({
        vault,
        marketId,
        cap,
        pendingCap,
        enabled,
        removableAt,
        publicAllocatorConfig,
    });
}
