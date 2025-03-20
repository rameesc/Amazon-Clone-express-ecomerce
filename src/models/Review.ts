import mongoose from "mongoose";




const reviewSchema=new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    comment: {
        type: String
    },
    star: {
        type: Number,
        max:5
    }


},{
    timestamps:true
})

export const Review =mongoose.models.Review || mongoose.model("Review",reviewSchema)