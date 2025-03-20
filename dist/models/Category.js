"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    systemName: {
        type: String,
        trim: true,
        required: true
    },
    displayName: {
        type: String,
        trim: true,
        required: true
    },
    parent: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ProductBrand"
    },
    image: {
        type: String,
        // required:true
    },
    brands: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Category"
        }],
    slug: {
        type: String
    },
    isDisabled: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Category = mongoose_1.default.models.Category || mongoose_1.default.model("Category", categorySchema);
