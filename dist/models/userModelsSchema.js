"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    role: {
        type: String,
        default: "user"
    },
    email: {
        type: String,
        trim: true
    },
    userId: {
        type: String,
        trim: true,
        unique: true
    },
    loginDomain: {
        type: String,
        default: "system",
        enum: ["system", "facebook", "google"]
    },
    password: {
        type: String
    },
    location: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "address"
    },
    phone: {
        type: String
    },
    socialPhoto: {
        type: String
    },
    dod: {
        type: String
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    restPasswordLink: {
        type: String,
        default: ""
    },
    emailVerifyLink: {
        type: String,
        default: ""
    },
    salt: String,
    isBlocked: {
        type: Date,
        default: null
    },
    photo: {
        type: String,
    }
}, {
    timestamps: true
});
exports.User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
