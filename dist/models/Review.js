"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment: {
        type: String
    },
    star: {
        type: Number,
        max: 5
    }
}, {
    timestamps: true
});
exports.Review = mongoose_1.default.models.Review || mongoose_1.default.model("Review", reviewSchema);
