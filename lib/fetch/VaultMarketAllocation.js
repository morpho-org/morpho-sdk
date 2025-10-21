"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVaultMarketAllocation = fetchVaultMarketAllocation;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const Position_1 = require("./Position");
const VaultMarketConfig_1 = require("./VaultMarketConfig");
async function fetchVaultMarketAllocation(vault, marketId, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const [config, position] = await Promise.all([
        (0, VaultMarketConfig_1.fetchVaultMarketConfig)(vault, marketId, client, parameters),
        (0, Position_1.fetchAccrualPosition)(vault, marketId, client, parameters),
    ]);
    return new blue_sdk_1.VaultMarketAllocation({ config, position });
}
