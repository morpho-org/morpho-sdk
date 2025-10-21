"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVaultUser = fetchVaultUser;
const viem_1 = require("viem");
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const GetVaultUser_1 = require("../queries/GetVaultUser");
const VaultConfig_1 = require("./VaultConfig");
async function fetchVaultUser(vault, user, client, { deployless = true, ...parameters } = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    if (deployless) {
        try {
            const { isAllocator, allowance } = await (0, actions_1.readContract)(client, {
                ...parameters,
                abi: GetVaultUser_1.abi,
                code: GetVaultUser_1.code,
                functionName: "query",
                args: [vault, user],
            });
            return new blue_sdk_1.VaultUser({
                vault,
                user,
                isAllocator,
                allowance,
            });
        }
        catch {
            // Fallback to multicall if deployless call fails.
        }
    }
    const config = await (0, VaultConfig_1.fetchVaultConfig)(vault, client, parameters);
    const [allowance, isAllocator] = await Promise.all([
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: config.asset,
            abi: viem_1.erc20Abi,
            functionName: "allowance",
            args: [user, vault],
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address: vault,
            abi: abis_1.metaMorphoAbi,
            functionName: "isAllocator",
            args: [user],
        }),
    ]);
    return new blue_sdk_1.VaultUser({
        vault,
        user,
        isAllocator,
        allowance,
    });
}
