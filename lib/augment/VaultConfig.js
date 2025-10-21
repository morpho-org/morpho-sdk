"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultConfig = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "VaultConfig", { enumerable: true, get: function () { return blue_sdk_1.VaultConfig; } });
const fetch_1 = require("../fetch");
blue_sdk_1.VaultConfig.fetch = fetch_1.fetchVaultConfig;
