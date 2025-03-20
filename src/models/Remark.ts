import mongoose from "mongoose";




const remarkSchema= new mongoose.Schema({

    comment: {
        type: String
    },
    isDeleted: {
        type: Date,
        default: null
    },



},{
    timestamps:true
})


export const Remark =mongoose.models.Remark || mongoose.model('Remark',remarkSchema)