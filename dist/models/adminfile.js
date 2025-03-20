"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adminfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminfileSchema = new mongoose_1.default.Schema({
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin"
    },
    fileUrl: {
        type: String
    }
}, {
    timestamps: true
});
exports.Adminfile = mongoose_1.default.models.Adminfile || mongoose_1.default.model("Adminfile", adminfileSchema);
