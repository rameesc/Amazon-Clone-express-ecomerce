import mongoose from "mongoose";



const adminBankSchema=new mongoose.Schema({

    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Admin',
        required:true
    },
    accountHolder:{
        type:String,
        trim:true,
        required:true
    },
    bankname:{
        type:String,
        trim:true,
        required:true
    },
    branchName:{
        type:String,
        trim:true,
        required:true
    },
    accoundNumber:{
        type:String,
        trim:true,
        required:true
    },
    routingNumber:{
        type:String,
        trim:true,
        required:true
    },
    chequeCopy:{
        type:mongoose.Schema.ObjectId,
        ref:'Adminfile'
    },
    isVerified:{
        type:Date,
        default:null
    }



},{
    timestamps:true
})

export const AdminBank=mongoose.models.AdminBank || mongoose.model("AdminBank",adminBankSchema)