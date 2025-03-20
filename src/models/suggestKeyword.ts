import mongoose from "mongoose";



const suggestKeywordSchema=new mongoose.Schema({

    keyword:{
        type:String,
        unique:true
    },
    isDeleted:{
        type:Date,
        default:null
    }
},{
    timestamps:true
})

export const SuggestKeyword= mongoose.models.SuggestKeyword || mongoose.model("SuggestKeyword",suggestKeywordSchema)