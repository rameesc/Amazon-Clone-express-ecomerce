"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const schemaRefreshToken = new mongoose_1.default.Schema({
    refreshToken: {
        type: String,
        default: ''
    },
    userIP: {
        type: String
    }
});
exports.RefreshToken = mongoose_1.default.models.RefreshToken || mongoose_1.default.model('RefreshToken', schemaRefreshToken);
