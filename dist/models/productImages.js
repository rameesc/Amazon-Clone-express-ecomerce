"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImages = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const productImagesSchema = new mongoose_1.default.Schema({
    thumbnail: {
        type: String
    },
    medium: {
        type: String
    },
    large: {
        type: String
    },
    productLink: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    }
}, {
    timestamps: true
});
exports.ProductImages = mongoose_1.default.models.ProductImages || mongoose_1.default.model("ProductImages", productImagesSchema);
