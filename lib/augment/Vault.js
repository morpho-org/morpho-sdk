"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccrualVault = exports.Vault = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "AccrualVault", { enumerable: true, get: function () { return blue_sdk_1.AccrualVault; } });
Object.defineProperty(exports, "Vault", { enumerable: true, get: function () { return blue_sdk_1.Vault; } });
const fetch_1 = require("../fetch");
blue_sdk_1.Vault.fetch = fetch_1.fetchVault;
blue_sdk_1.AccrualVault.fetch = fetch_1.fetchAccrualVault;
