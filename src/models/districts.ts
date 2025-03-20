import mongoose from "mongoose";
import { districts } from "../middleware/common";




const districtSchema= new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        enum:districts
    }
},{
    timestamps:true
})

export const District = mongoose.models.District ||  mongoose.model("District",districtSchema);
