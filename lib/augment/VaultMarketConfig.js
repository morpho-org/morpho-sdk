"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultMarketConfig = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "VaultMarketConfig", { enumerable: true, get: function () { return blue_sdk_1.VaultMarketConfig; } });
const fetch_1 = require("../fetch");
blue_sdk_1.VaultMarketConfig.fetch = fetch_1.fetchVaultMarketConfig;
