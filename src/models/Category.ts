import mongoose from "mongoose";



const categorySchema=new mongoose.Schema({

    systemName:{
        type:String,
        trim:true,
        required:true
    },
    displayName:{
        type:String,
        trim:true,
        required:true
    },
    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ProductBrand"
    },
    image:{
        type:String,
        // required:true
    },
    brands:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }],
    slug:{
        type:String
    },
    isDisabled:{
        type:Date,
        default:null
    }


},{
    timestamps:true
})


export const Category = mongoose.models.Category || mongoose.model("Category",categorySchema)
