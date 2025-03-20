import mongoose from "mongoose";

const wishlistSchema=new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    product: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    quantity: {
        type: Number,
        default:1
    },
    isDeleted: {
        type: Date,
        default: null
    }
},{
    timestamps:true
})

export const WishList = mongoose.models.WishList || mongoose.model("WishList",wishlistSchema);
