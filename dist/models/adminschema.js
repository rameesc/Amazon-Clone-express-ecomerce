"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const pointSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["point"]
    },
    coordinates: {
        type: [Number]
    }
});
const adminSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    geolocation: {
        type: pointSchema //of superadmin used to calculate geodistance between user nd the order dispatch system
    },
    shopname: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    shippingRate: {
        type: Number //added only by superadmin
    },
    shippingCost: {
        type: Number //added only superadmin
    },
    district: {
        type: String,
        trim: true
    },
    muncipality: {
        type: String,
        trim: true
    },
    wardno: {
        type: Number
    },
    businessInfo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Businessinfo"
    },
    adminBank: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AdminBank"
    },
    adminWareHouse: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "AdminWareHouse"
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
    photo: {
        type: String
    },
    holidayMode: {
        start: {
            type: Number
        },
        end: {
            type: Number
        }
    },
    salt: {
        type: String,
    },
    role: {
        type: String,
        enum: ["admin", "superadmin"],
        default: "admin"
    },
    resetPasswordLink: {
        type: String,
        default: ''
    },
    emailVerifyLink: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Date,
        default: null
    },
    isBlocked: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Admin = mongoose_1.default.models.Admin || mongoose_1.default.model("Admin", adminSchema);
