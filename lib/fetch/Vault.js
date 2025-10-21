"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVault = fetchVault;
exports.fetchAccrualVault = fetchAccrualVault;
const viem_1 = require("viem");
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const VaultMarketAllocation_1 = require("./VaultMarketAllocation");
const GetVault_1 = require("../queries/GetVault");
const VaultConfig_1 = require("./VaultConfig");
async function fetchVault(address, client, { deployless = true, ...parameters } = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const { publicAllocator } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    if (deployless) {
        try {
            const { config, owner, curator, guardian, timelock, pendingTimelock, pendingGuardian, pendingOwner, fee, feeRecipient, skimRecipient, totalSupply, totalAssets, lastTotalAssets, supplyQueue, withdrawQueue, publicAllocatorConfig, } = await (0, actions_1.readContract)(client, {
                ...parameters,
                abi: GetVault_1.abi,
                code: GetVault_1.code,
                functionName: "query",
                args: [address, publicAllocator ?? viem_1.zeroAddress],
            });
            return new blue_sdk_1.Vault({
                ...new blue_sdk_1.VaultConfig({
                    ...config,
                    eip5267Domain: new blue_sdk_1.Eip5267Domain(config.eip5267Domain),
                    address,
                }),
                owner,
                curator,
                guardian,
                feeRecipient,
                skimRecipient,
                timelock,
                fee,
                pendingOwner,
                pendingGuardian,
                pendingTimelock,
                publicAllocatorConfig: publicAllocator != null ? publicAllocatorConfig : undefined,
                supplyQueue: supplyQueue,
                withdrawQueue: withdrawQueue,
                totalSupply,
                totalAssets,
                lastTotalAssets,
            });
        }
        catch {
            // Fallback to multicall if deployless call fails.
        }
    }
    const [config, curator, owner, guardian, timelock, pendingTimelock, pendingGuardian, pendingOwner, fee, feeRecipient, skimRecipient, totalSupply, totalAssets, lastTotalAssets, lostAssets, supplyQueueSize, withdrawQueueSize, hasPublicAllocator,] = await Promise.all([
        (0, VaultConfig_1.fetchVaultConfig)(address, client, parameters),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "curator",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "owner",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "guardian",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "timelock",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "pendingTimelock",
        }).then(([value, validAt]) => ({ value, validAt })),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "pendingGuardian",
        }).then(([value, validAt]) => ({ value, validAt })),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "pendingOwner",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "fee",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "feeRecipient",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "skimRecipient",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "totalSupply",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "totalAssets",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "lastTotalAssets",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "lostAssets",
        }).catch(() => undefined),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "supplyQueueLength",
        }),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "withdrawQueueLength",
        }),
        publicAllocator != null &&
            (0, actions_1.readContract)(client, {
                ...parameters,
                address,
                abi: abis_1.metaMorphoAbi,
                functionName: "isAllocator",
                args: [publicAllocator],
            }),
    ]);
    let publicAllocatorConfigPromise;
    if (hasPublicAllocator)
        publicAllocatorConfigPromise = Promise.all([
            (0, actions_1.readContract)(client, {
                ...parameters,
                address: publicAllocator,
                abi: abis_1.publicAllocatorAbi,
                functionName: "admin",
                args: [address],
            }),
            (0, actions_1.readContract)(client, {
                ...parameters,
                address: publicAllocator,
                abi: abis_1.publicAllocatorAbi,
                functionName: "fee",
                args: [address],
            }),
            (0, actions_1.readContract)(client, {
                ...parameters,
                address: publicAllocator,
                abi: abis_1.publicAllocatorAbi,
                functionName: "accruedFee",
                args: [address],
            }),
        ]).then(([admin, fee, accruedFee]) => ({ admin, fee, accruedFee }));
    const [supplyQueue, withdrawQueue, publicAllocatorConfig] = await Promise.all([
        Promise.all(new Array(Number(supplyQueueSize)).fill(null).map((_, i) => (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "supplyQueue",
            args: [BigInt(i)],
        }))),
        Promise.all(new Array(Number(withdrawQueueSize)).fill(null).map((_, i) => (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.metaMorphoAbi,
            functionName: "withdrawQueue",
            args: [BigInt(i)],
        }))),
        publicAllocatorConfigPromise,
    ]);
    return new blue_sdk_1.Vault({
        ...config,
        owner,
        curator,
        guardian,
        feeRecipient,
        skimRecipient,
        timelock,
        fee,
        pendingOwner,
        pendingGuardian,
        pendingTimelock,
        publicAllocatorConfig,
        supplyQueue,
        withdrawQueue,
        totalSupply,
        totalAssets,
        lastTotalAssets,
        lostAssets,
    });
}
async function fetchAccrualVault(address, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const vault = await fetchVault(address, client, parameters);
    const allocations = await Promise.all(Array.from(vault.withdrawQueue, (marketId) => (0, VaultMarketAllocation_1.fetchVaultMarketAllocation)(vault.address, marketId, client, parameters)));
    return new blue_sdk_1.AccrualVault(vault, allocations);
}
