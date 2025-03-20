"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const leadSchema = new mongoose_1.default.Schema({
    email: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Lead = mongoose_1.default.models.Lead || mongoose_1.default.model("Lead", leadSchema);
