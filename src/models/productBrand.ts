import mongoose from "mongoose";


const productBrandSchema=new mongoose.Schema({

    brandName: {
        type : String
    },
    systemName: {
        type: String,
        unique: true
    },
    slug:{
        type: String
    }


})


export const ProductBrand =mongoose.models.ProductBrand || mongoose.model("ProductBrand",productBrandSchema)