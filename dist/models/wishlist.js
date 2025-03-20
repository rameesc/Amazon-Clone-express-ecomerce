"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishList = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wishlistSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product"
    },
    quantity: {
        type: Number,
        default: 1
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.WishList = mongoose_1.default.models.WishList || mongoose_1.default.model("WishList", wishlistSchema);
