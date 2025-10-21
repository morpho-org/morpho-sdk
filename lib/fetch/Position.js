"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPosition = fetchPosition;
exports.fetchPreLiquidationParams = fetchPreLiquidationParams;
exports.fetchAccrualPosition = fetchAccrualPosition;
exports.fetchPreLiquidationPosition = fetchPreLiquidationPosition;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const utils_1 = require("../utils");
const Market_1 = require("./Market");
async function fetchPosition(user, marketId, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const { morpho } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    const position = await (0, utils_1.readContractRestructured)(client, {
        ...parameters,
        address: morpho,
        abi: abis_1.blueAbi,
        functionName: "position",
        args: [marketId, user],
    });
    return new blue_sdk_1.Position({
        user,
        marketId,
        ...position,
    });
}
async function fetchPreLiquidationParams(preLiquidation, client, parameters = {}) {
    parameters.chainId = await (0, actions_1.getChainId)(client);
    const { preLltv, preLIF1, preLIF2, preLCF1, preLCF2, preLiquidationOracle } = await (0, actions_1.readContract)(client, {
        ...parameters,
        address: preLiquidation,
        abi: abis_1.preLiquidationAbi,
        functionName: "preLiquidationParams",
    });
    return new blue_sdk_1.PreLiquidationParams({
        preLltv,
        preLCF1,
        preLCF2,
        preLIF1,
        preLIF2,
        preLiquidationOracle,
    });
}
async function fetchAccrualPosition(user, marketId, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const [position, market] = await Promise.all([
        await fetchPosition(user, marketId, client, parameters),
        await (0, Market_1.fetchMarket)(marketId, client, parameters),
    ]);
    return new blue_sdk_1.AccrualPosition(position, market);
}
async function fetchPreLiquidationPosition(user, marketId, preLiquidation, client, parameters = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    const [position, market, preLiquidationParams] = await Promise.all([
        fetchPosition(user, marketId, client, parameters),
        (0, Market_1.fetchMarket)(marketId, client, parameters),
        fetchPreLiquidationParams(preLiquidation, client, parameters),
    ]);
    const preLiquidationOraclePrice = await (0, actions_1.readContract)(client, {
        ...parameters,
        address: preLiquidationParams.preLiquidationOracle,
        abi: abis_1.blueOracleAbi,
        functionName: "price",
    }).catch(() => undefined);
    return new blue_sdk_1.PreLiquidationPosition({
        ...position,
        preLiquidationParams,
        preLiquidation,
        preLiquidationOraclePrice,
    }, market);
}
