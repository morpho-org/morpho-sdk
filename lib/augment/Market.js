"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Market = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "Market", { enumerable: true, get: function () { return blue_sdk_1.Market; } });
const fetch_1 = require("../fetch");
blue_sdk_1.Market.fetch = fetch_1.fetchMarket;
