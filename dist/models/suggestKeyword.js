"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestKeyword = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const suggestKeywordSchema = new mongoose_1.default.Schema({
    keyword: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.SuggestKeyword = mongoose_1.default.models.SuggestKeyword || mongoose_1.default.model("SuggestKeyword", suggestKeywordSchema);
