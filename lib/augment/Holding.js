"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Holding = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "Holding", { enumerable: true, get: function () { return blue_sdk_1.Holding; } });
const fetch_1 = require("../fetch");
blue_sdk_1.Holding.fetch = fetch_1.fetchHolding;
