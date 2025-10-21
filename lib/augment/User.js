"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const blue_sdk_1 = require("@morpho-org/blue-sdk");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return blue_sdk_1.User; } });
const fetch_1 = require("../fetch");
blue_sdk_1.User.fetch = fetch_1.fetchUser;
