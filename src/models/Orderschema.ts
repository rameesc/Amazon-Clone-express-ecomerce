import mongoose from "mongoose";
import { allOrderStatus } from "../middleware/common";



const pointSchema = new mongoose.Schema({

    type: {
        type: String,
        enum: ['Point']
    },
    coordinates: {
        type: [Number]
    }
});

const orderSchema= new mongoose.Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    orderID:{
        type: String,
        require: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    },
    quantity: {
        type: Number
    },
    soldBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    status: {
        currentStatus: {
            type: String,
            enum: allOrderStatus
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
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Dispatch'
            },
        },
        cancelledDetail: {
            cancelledDate:{
                type: Date,
                default: null
            },
            cancelledByUser:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            cancelledByAdmin:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Admin"
            },
            remark: {
                type: mongoose.Schema.Types.ObjectId,
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
                type: mongoose.Schema.Types.ObjectId,
                ref:'Dispatch'
            },
            remark: [{
                type: mongoose.Schema.Types.ObjectId,
                ref:'Remark'
            }],
        },
    },
    shipto:{
        region: {//pradesh
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        area: {//tole,area name
            type: String,
            trim: true,
        },
        address: {//street level address
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
    isPaid:{
        type: Boolean,
        default: false
    },
    cancelledByModel: {
        type: String,
        enum: ['user', 'admin']
    },
    productAttributes:{
        type: String,
    }
},{
    timestamps:true
})


export const Order= mongoose.models.Order || mongoose.model("Order",orderSchema);
