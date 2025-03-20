import mongoose from "mongoose";




const adminWareHouseSchema=new mongoose.Schema({

    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    },
    name:{
        type:String,
        trim:true,
        required:true
    },
    address:{
        type:String,
        trim:true,
        required:true
    },
    phone:{
        type:String,
        trim:true,
        required:true
    },
    city:{
        type:String,
        trim:true,
        required:true
    },
    isVerified:{
        type:Date,
        default:null
    }



},{
    timestamps:true
})


export const AdminWareHouse=mongoose.models.AdminWareHouse || mongoose.model("AdminWareHouse",adminWareHouseSchema)