"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultMarketAllocation = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "VaultMarketAllocation", { enumerable: true, get: function () { return blue_sdk_1.VaultMarketAllocation; } });
const fetch_1 = require("../fetch");
blue_sdk_1.VaultMarketAllocation.fetch = fetch_1.fetchVaultMarketAllocation;
