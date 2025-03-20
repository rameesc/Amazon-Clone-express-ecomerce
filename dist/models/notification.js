"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    admin: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin"
    },
    notifications: [{
            notificationType: String,
            notificationDetail: Object,
            hasRead: {
                type: Boolean,
                default: false
            },
            date: {
                type: Date
            }
        }],
    noOfUnseen: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});
exports.Notification = mongoose_1.default.models.Notification || mongoose_1.default.model("Notification", notificationSchema);
