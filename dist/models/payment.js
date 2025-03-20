"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    method: {
        type: String,
        enum: ['Cash on Delivery', 'manual'] //manual ==> bank or manual esewa..
    },
    shippingCharge: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    returnedAmount: {
        type: Number,
        default: null
    },
    transactionCode: {
        type: String,
        required: true
    },
    from: {
        type: Number,
        max: 9999999999 //!esewa && receiverNumber
    },
    isDeleted: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
exports.Payment = mongoose_1.default.models.Payment || mongoose_1.default.model("Payment", paymentSchema);
