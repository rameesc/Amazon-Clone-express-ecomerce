import mongoose from "mongoose";



const businessInfo=new mongoose.Schema({


    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin",
        required:true
    },
    ownerName:{
        type:String,
        trim:true,
        required:true
    },
    address:{
        type:String,
        trim:true,
        required:true
    },
    city:{
        type:String,
        required:true,
        trim:true
    },
    citizenshipNumber: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    businessRegisterNumber:{
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    citizenshipFront: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    citizenshipBack: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    businessLicence:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adminfile",
    },
    isVerified:{
        type: Date,//as we may need verified date
        default: null
    }


},{
    timestamps:true
})


export const Businessinfo= mongoose.models.Businessinfo || mongoose.model("Businessinfo",businessInfo)