"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bannerSchema = new mongoose_1.default.Schema({
    bannerPhoto: {
        type: String
    },
    link: {
        type: String
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product"
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Banner = mongoose_1.default.models.Banner || mongoose_1.default.model("Banner", bannerSchema);
