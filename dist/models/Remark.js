"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Remark = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const remarkSchema = new mongoose_1.default.Schema({
    comment: {
        type: String
    },
    isDeleted: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});
exports.Remark = mongoose_1.default.models.Remark || mongoose_1.default.model('Remark', remarkSchema);
