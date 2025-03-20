"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatch = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dispatcherSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    address: {
        type: String,
        trim: true,
        maxlength: 32
    },
    phone: {
        type: Number,
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: String,
    resetPasswordLink: {
        type: String,
        default: ""
    },
    isBlocked: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Dispatch = mongoose_1.default.models.Dispatch || mongoose_1.default.model("Dispatch", dispatcherSchema);
