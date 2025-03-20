import mongoose from "mongoose";


const schemaRefreshToken= new mongoose.Schema({

    refreshToken:{
        type:String,
        default:''
    },
    userIP:{
        type:String
    }

})

export const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken',schemaRefreshToken)