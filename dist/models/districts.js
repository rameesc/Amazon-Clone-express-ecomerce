"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.District = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../middleware/common");
const districtSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        unique: true,
        enum: common_1.districts
    }
}, {
    timestamps: true
});
exports.District = mongoose_1.default.models.District || mongoose_1.default.model("District", districtSchema);
