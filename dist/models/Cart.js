"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cart = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const cartSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    productAttributes: {
        type: String
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Cart = mongoose_1.default.models.Cart || mongoose_1.default.model("Cart", cartSchema);
