"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    city: {
        type: String,
        trim: true
    },
    area: {
        type: String,
        trim: true
    },
    label: {
        type: String,
        trim: true,
        enum: ["home", "office", "other"]
    },
    address: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    pinCode: {
        type: String
    },
    isActive: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Address = mongoose_1.default.models.Address || mongoose_1.default.model("Address", addressSchema);
