import mongoose from "mongoose";


const productImagesSchema=new mongoose.Schema({

    thumbnail: {
        type: String
    },
    medium: {
        type: String
    },
    large: {
        type:String
    },
    productLink:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    }


},{
    timestamps:true
})

export const ProductImages =mongoose.models.ProductImages || mongoose.model("ProductImages",productImagesSchema)