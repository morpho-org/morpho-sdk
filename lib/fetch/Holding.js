"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalBoolean = void 0;
exports.fetchHolding = fetchHolding;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const viem_1 = require("viem");
const actions_1 = require("viem/actions");
const morpho_ts_1 = require("@morpho-org/morpho-ts");
const abis_1 = require("../abis");
const GetHolding_1 = require("../queries/GetHolding");
exports.optionalBoolean = [undefined, false, true];
async function fetchHolding(user, token, client, { deployless = true, ...parameters } = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    if (token === blue_sdk_1.NATIVE_ADDRESS)
        return new blue_sdk_1.Holding({
            user,
            token,
            erc20Allowances: (0, morpho_ts_1.fromEntries)(blue_sdk_1.ERC20_ALLOWANCE_RECIPIENTS.map((label) => [label, viem_1.maxUint256])),
            permit2BundlerAllowance: {
                amount: 0n,
                expiration: 0n,
                nonce: 0n,
            },
            balance: await (0, actions_1.getBalance)(client, {
                // biome-ignore lint/suspicious/noExplicitAny: flattened union type
                ...parameters,
                address: user,
            }),
        });
    if (deployless) {
        const { morpho, permit2 = viem_1.zeroAddress, bundler3: { generalAdapter1 }, } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
        try {
            const { balance, erc20Allowances: { generalAdapter1: generalAdapter1Erc20Allowance, ...erc20Allowances }, permit2BundlerAllowance, isErc2612, erc2612Nonce, canTransfer, } = await (0, actions_1.readContract)(client, {
                ...parameters,
                abi: GetHolding_1.abi,
                code: GetHolding_1.code,
                functionName: "query",
                args: [
                    token,
                    user,
                    morpho,
                    permit2,
                    generalAdapter1,
                    !!blue_sdk_1.permissionedBackedTokens[parameters.chainId]?.has(token),
                    !!blue_sdk_1.permissionedWrapperTokens[parameters.chainId]?.has(token),
                ],
            });
            return new blue_sdk_1.Holding({
                user,
                token,
                erc20Allowances: {
                    "bundler3.generalAdapter1": generalAdapter1Erc20Allowance,
                    ...erc20Allowances,
                },
                permit2BundlerAllowance,
                erc2612Nonce: isErc2612 ? erc2612Nonce : undefined,
                balance,
                canTransfer: exports.optionalBoolean[canTransfer],
            });
        }
        catch {
            // Fallback to multicall if deployless call fails.
        }
    }
    const chainAddresses = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    const [balance, erc20Allowances, permit2BundlerAllowance, erc2612Nonce, whitelistControllerAggregator, hasErc20WrapperPermission,] = await Promise.all([
        (0, actions_1.readContract)(client, {
            ...parameters,
            abi: viem_1.erc20Abi,
            address: token,
            functionName: "balanceOf",
            args: [user],
        }),
        Promise.all(blue_sdk_1.ERC20_ALLOWANCE_RECIPIENTS.map(async (label) => {
            const spender = (0, morpho_ts_1.getValue)(chainAddresses, label);
            if (spender == null)
                return [label, 0n];
            return [
                label,
                await (0, actions_1.readContract)(client, {
                    ...parameters,
                    abi: viem_1.erc20Abi,
                    address: token,
                    functionName: "allowance",
                    args: [user, spender],
                }),
            ];
        })),
        chainAddresses.permit2 != null
            ? (0, actions_1.readContract)(client, {
                ...parameters,
                abi: abis_1.permit2Abi,
                address: chainAddresses.permit2,
                functionName: "allowance",
                args: [user, token, chainAddresses.bundler3.generalAdapter1],
            }).then(([amount, expiration, nonce]) => ({
                amount,
                expiration: BigInt(expiration),
                nonce: BigInt(nonce),
            }))
            : { amount: 0n, expiration: 0n, nonce: 0n },
        (0, actions_1.readContract)(client, {
            ...parameters,
            abi: abis_1.erc2612Abi,
            address: token,
            functionName: "nonces",
            args: [user],
        }).catch(() => undefined),
        blue_sdk_1.permissionedBackedTokens[parameters.chainId]?.has(token)
            ? (0, actions_1.readContract)(client, {
                ...parameters,
                abi: abis_1.wrappedBackedTokenAbi,
                address: token,
                functionName: "whitelistControllerAggregator",
            })
            : undefined,
        (0, actions_1.readContract)(client, {
            ...parameters,
            abi: abis_1.permissionedErc20WrapperAbi,
            address: token,
            functionName: "hasPermission",
            args: [user],
        }).catch(() => !blue_sdk_1.permissionedWrapperTokens[parameters.chainId]?.has(token)),
    ]);
    const holding = new blue_sdk_1.Holding({
        user,
        token,
        erc20Allowances: (0, morpho_ts_1.fromEntries)(erc20Allowances),
        permit2BundlerAllowance,
        erc2612Nonce,
        balance,
        canTransfer: hasErc20WrapperPermission,
    });
    if (whitelistControllerAggregator)
        holding.canTransfer = await (0, actions_1.readContract)(client, {
            ...parameters,
            abi: abis_1.whitelistControllerAggregatorV2Abi,
            address: whitelistControllerAggregator,
            functionName: "isWhitelisted",
            args: [user],
        }).catch(() => undefined);
    return holding;
}
