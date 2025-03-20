import mongoose from "mongoose";




const adminfileSchema=new mongoose.Schema({
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    fileUrl:{
        type:String
    }

},{
    timestamps:true
})

export const Adminfile=mongoose.models.Adminfile || mongoose.model("Adminfile",adminfileSchema)