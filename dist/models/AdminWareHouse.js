"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWareHouse = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminWareHouseSchema = new mongoose_1.default.Schema({
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin",
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    address: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        required: true
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    isVerified: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.AdminWareHouse = mongoose_1.default.models.AdminWareHouse || mongoose_1.default.model("AdminWareHouse", adminWareHouseSchema);
