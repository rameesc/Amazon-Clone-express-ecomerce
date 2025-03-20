import mongoose from "mongoose";



const cartSchema= new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default:1
    },
    productAttributes: {
        type: String
    },
    isDeleted: {
        type: Date,
        default: null
    }


},{
    timestamps:true
})

export const Cart= mongoose.models.Cart || mongoose.model("Cart",cartSchema)