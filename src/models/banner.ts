import mongoose from "mongoose";




const bannerSchema=new mongoose.Schema({

    bannerPhoto:{
        type:String
    },
    link:{
        type:String
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    isDeleted:{
        type:Date,
        default:null
    }
},{
    timestamps:true
})

export const Banner =mongoose.models.Banner || mongoose.model("Banner",bannerSchema);
