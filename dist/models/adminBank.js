"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBank = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminBankSchema = new mongoose_1.default.Schema({
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    accountHolder: {
        type: String,
        trim: true,
        required: true
    },
    bankname: {
        type: String,
        trim: true,
        required: true
    },
    branchName: {
        type: String,
        trim: true,
        required: true
    },
    accoundNumber: {
        type: String,
        trim: true,
        required: true
    },
    routingNumber: {
        type: String,
        trim: true,
        required: true
    },
    chequeCopy: {
        type: mongoose_1.default.Schema.ObjectId,
        ref: 'Adminfile'
    },
    isVerified: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.AdminBank = mongoose_1.default.models.AdminBank || mongoose_1.default.model("AdminBank", adminBankSchema);
