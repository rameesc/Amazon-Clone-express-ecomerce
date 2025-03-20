import mongoose from "mongoose";




const dispatcherSchema=new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32
    },
    address: {
        type: String,
        trim: true,
        maxlength: 32
    },
    phone: {
        type: Number,
      
    },
    email: {
        type: String,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    salt: String,
    resetPasswordLink: {
        type: String,
        default: ""
    },
    isBlocked: {
        type: Date,
        default: null
    }


},{
    timestamps:true
});


export const Dispatch=mongoose.models.Dispatch || mongoose.model("Dispatch",dispatcherSchema)