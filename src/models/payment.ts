import mongoose from "mongoose";



const paymentSchema= new mongoose.Schema({


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    method: {
        type: String,
        enum: ['Cash on Delivery','manual']//manual ==> bank or manual esewa..
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
    from:{
        type:Number,
        max: 9999999999 //!esewa && receiverNumber
    },
    isDeleted: {
        type: Date,
        default: null

    }

},{
    timestamps:true
})


export const Payment = mongoose.models.Payment || mongoose.model("Payment",paymentSchema)