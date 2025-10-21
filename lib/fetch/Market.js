"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMarket = fetchMarket;
const viem_1 = require("viem");
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const GetMarket_1 = require("../queries/GetMarket");
const utils_1 = require("../utils");
async function fetchMarket(id, client, { deployless = true, ...parameters } = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const { morpho, adaptiveCurveIrm } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    if (deployless) {
        try {
            const { marketParams, market: { totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee, }, hasPrice, price, rateAtTarget, } = await (0, actions_1.readContract)(client, {
                ...parameters,
                abi: GetMarket_1.abi,
                code: GetMarket_1.code,
                functionName: "query",
                args: [morpho, id, adaptiveCurveIrm],
            });
            return new blue_sdk_1.Market({
                params: new blue_sdk_1.MarketParams(marketParams),
                totalSupplyAssets,
                totalBorrowAssets,
                totalSupplyShares,
                totalBorrowShares,
                lastUpdate,
                fee,
                price: hasPrice ? price : undefined,
                rateAtTarget: marketParams.irm === adaptiveCurveIrm ? rateAtTarget : undefined,
            });
        }
        catch {
            // Fallback to multicall if deployless call fails.
        }
    }
    const [params, market] = await Promise.all([
        (0, utils_1.readContractRestructured)(client, {
            ...parameters,
            address: morpho,
            abi: abis_1.blueAbi,
            functionName: "idToMarketParams",
            args: [id],
        }),
        (0, utils_1.readContractRestructured)(client, {
            ...parameters,
            address: morpho,
            abi: abis_1.blueAbi,
            functionName: "market",
            args: [id],
        }),
    ]);
    const [price, rateAtTarget] = await Promise.all([
        params.oracle !== viem_1.zeroAddress
            ? (0, actions_1.readContract)(client, {
                ...parameters,
                address: params.oracle,
                abi: abis_1.blueOracleAbi,
                functionName: "price",
            }).catch(() => undefined)
            : undefined,
        params.irm === adaptiveCurveIrm
            ? await (0, actions_1.readContract)(client, {
                ...parameters,
                address: adaptiveCurveIrm,
                abi: abis_1.adaptiveCurveIrmAbi,
                functionName: "rateAtTarget",
                args: [id],
            })
            : undefined,
    ]);
    return new blue_sdk_1.Market({
        params,
        ...market,
        price,
        rateAtTarget,
    });
}
