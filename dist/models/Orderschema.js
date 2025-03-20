"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const common_1 = require("../middleware/common");
const pointSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ['Point']
    },
    coordinates: {
        type: [Number]
    }
});
const orderSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderID: {
        type: String,
        require: true
    },
    product: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    payment: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Payment",
    },
    quantity: {
        type: Number
    },
    soldBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Admin"
    },
    status: {
        currentStatus: {
            type: String,
            enum: common_1.allOrderStatus
        },
        activeDate: {
            type: Date,
            default: null
        },
        approvedDate: {
            type: Date,
            default: null
        },
        dispatchedDetail: {
            dispatchedDate: {
                type: Date,
                default: null
            },
            dispatchedBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Dispatch'
            },
        },
        cancelledDetail: {
            cancelledDate: {
                type: Date,
                default: null
            },
            cancelledByUser: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User"
            },
            cancelledByAdmin: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Admin"
            },
            remark: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Remark'
            },
        },
        completedDate: {
            type: Date,
            default: null
        },
        tobereturnedDate: {
            type: Date,
            default: null
        },
        // tobeReturnedDetail: {
        //     tobereturnedDate: {
        //         type: Date
        //     },
        //     remark: {
        //         type: Schema.Types.ObjectId,
        //         ref: 'remark'
        //     },
        // },        
        returnedDetail: {
            returnedDate: {
                type: Date,
                default: null
            },
            returneddBy: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'Dispatch'
            },
            remark: [{
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: 'Remark'
                }],
        },
    },
    shipto: {
        region: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        area: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        geolocation: {
            type: pointSchema,
        },
        phoneno: {
            type: String,
            trim: true,
            max: 9999999999,
        }
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    cancelledByModel: {
        type: String,
        enum: ['user', 'admin']
    },
    productAttributes: {
        type: String,
    }
}, {
    timestamps: true
});
exports.Order = mongoose_1.default.models.Order || mongoose_1.default.model("Order", orderSchema);
