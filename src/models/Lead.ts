import mongoose from "mongoose";


const leadSchema=new mongoose.Schema({

    email: {
        type: String,
        unique: true
    },
    isDeleted: {
        type: Date,
        default: null
    }


},{
    timestamps:true
})


export const Lead=mongoose.models.Lead || mongoose.model("Lead",leadSchema)