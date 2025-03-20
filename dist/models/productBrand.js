"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductBrand = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productBrandSchema = new mongoose_1.default.Schema({
    brandName: {
        type: String
    },
    systemName: {
        type: String,
        unique: true
    },
    slug: {
        type: String
    }
});
exports.ProductBrand = mongoose_1.default.models.ProductBrand || mongoose_1.default.model("ProductBrand", productBrandSchema);
