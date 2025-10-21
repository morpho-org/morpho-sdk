"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeBytes32String = void 0;
exports.fetchToken = fetchToken;
const viem_1 = require("viem");
const blue_sdk_1 = require("@morpho-org/blue-sdk");
const actions_1 = require("viem/actions");
const abis_1 = require("../abis");
const GetToken_1 = require("../queries/GetToken");
const decodeBytes32String = (hexOrStr) => {
    if ((0, viem_1.isHex)(hexOrStr))
        return (0, viem_1.hexToString)(hexOrStr, { size: 32 });
    return hexOrStr;
};
exports.decodeBytes32String = decodeBytes32String;
async function fetchToken(address, client, { deployless = true, ...parameters } = {}) {
    parameters.chainId ??= await (0, actions_1.getChainId)(client);
    if (address === blue_sdk_1.NATIVE_ADDRESS)
        return blue_sdk_1.Token.native(parameters.chainId);
    const { wstEth, stEth } = (0, blue_sdk_1.getChainAddresses)(parameters.chainId);
    if (deployless) {
        try {
            const isWstEth = address === wstEth;
            const token = await (0, actions_1.readContract)(client, {
                ...parameters,
                abi: GetToken_1.abi,
                code: GetToken_1.code,
                functionName: "query",
                args: [address, isWstEth],
            });
            const eip5267Domain = token.hasEip5267Domain
                ? new blue_sdk_1.Eip5267Domain(token.eip5267Domain)
                : undefined;
            if (isWstEth && stEth != null)
                return new blue_sdk_1.ExchangeRateWrappedToken({ ...token, address, eip5267Domain }, stEth, token.stEthPerWstEth);
            const unwrapToken = (0, blue_sdk_1.getUnwrappedToken)(address, parameters.chainId);
            if (unwrapToken)
                return new blue_sdk_1.ConstantWrappedToken({ ...token, address, eip5267Domain }, unwrapToken, token.decimals);
            return new blue_sdk_1.Token({ ...token, address, eip5267Domain });
        }
        catch {
            // Fallback to multicall if deployless call fails.
        }
    }
    const [decimals, symbol, name, eip5267Domain] = await Promise.all([
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: viem_1.erc20Abi,
            functionName: "decimals",
        }).catch(() => undefined),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: viem_1.erc20Abi,
            functionName: "symbol",
        }).catch(() => (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: viem_1.erc20Abi_bytes32,
            functionName: "symbol",
        })
            .then(exports.decodeBytes32String)
            .catch(() => undefined)),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: viem_1.erc20Abi,
            functionName: "name",
        }).catch(() => (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: viem_1.erc20Abi_bytes32,
            functionName: "name",
        })
            .then(exports.decodeBytes32String)
            .catch(() => undefined)),
        (0, actions_1.readContract)(client, {
            ...parameters,
            address,
            abi: abis_1.erc5267Abi,
            functionName: "eip712Domain",
        })
            .then(([fields, name, version, chainId, verifyingContract, salt, extensions,]) => new blue_sdk_1.Eip5267Domain({
            fields,
            name,
            version,
            chainId,
            verifyingContract,
            salt,
            extensions,
        }))
            .catch(() => undefined),
    ]);
    const token = {
        address,
        name,
        symbol,
        decimals,
        eip5267Domain,
    };
    switch (address) {
        case wstEth: {
            if (stEth) {
                const stEthPerWstEth = await (0, actions_1.readContract)(client, {
                    ...parameters,
                    address: wstEth,
                    abi: abis_1.wstEthAbi,
                    functionName: "stEthPerToken",
                });
                return new blue_sdk_1.ExchangeRateWrappedToken(token, stEth, stEthPerWstEth);
            }
            break;
        }
    }
    const unwrapToken = (0, blue_sdk_1.getUnwrappedToken)(address, parameters.chainId);
    if (unwrapToken)
        return new blue_sdk_1.ConstantWrappedToken(token, unwrapToken, token.decimals);
    return new blue_sdk_1.Token(token);
}
