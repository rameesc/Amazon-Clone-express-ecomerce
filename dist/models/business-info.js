"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Businessinfo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const businessInfo = new mongoose_1.default.Schema({
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    ownerName: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    citizenshipNumber: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    businessRegisterNumber: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    citizenshipFront: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    citizenshipBack: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    businessLicence: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    isVerified: {
        type: Date, //as we may need verified date
        default: null
    }
}, {
    timestamps: true
});
exports.Businessinfo = mongoose_1.default.models.Businessinfo || mongoose_1.default.model("Businessinfo", businessInfo);
