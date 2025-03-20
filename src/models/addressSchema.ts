import mongoose from "mongoose";

const addressSchema= new mongoose.Schema({
    
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    city:{
        type:String,
        trim:true
    },
    area:{
        type:String,
        trim:true

    },
    label:{
        type:String,
        trim:true,
        enum:["home","office","other"]
    },
    address:{
        type:String,
        trim:true
    },
    phone:{
        type:String,
        trim:true
    },
    country:{
        type:String
    },
    state:{
        type:String
    },
    pinCode:{
        type:String
    },
    isActive:{
        type:Date,
        default:null
    }
},{
    timestamps:true
})

export const Address =mongoose.models.Address || mongoose.model("Address",addressSchema);