"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultMarketPublicAllocatorConfig = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "VaultMarketPublicAllocatorConfig", { enumerable: true, get: function () { return blue_sdk_1.VaultMarketPublicAllocatorConfig; } });
const fetch_1 = require("../fetch");
blue_sdk_1.VaultMarketPublicAllocatorConfig.fetch = fetch_1.fetchVaultMarketPublicAllocatorConfig;
