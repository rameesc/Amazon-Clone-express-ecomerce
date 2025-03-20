import mongoose from "mongoose";

import { districts } from "../middleware/common";



const productSchema=new mongoose.Schema({

    name:{
        type:String,
        trim:true,
        required:true
    },
    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"ProductBrand"
    },
    quantity:{
        type:Number,
        trim:true,
        required:true
    },
    category:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Category"

    }],
    averageRating:{
        type:Number
    },
    totalRatingUser:{
        type:Number
    },
    soldBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    images:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'ProductImages'
        }
    ],
    warranty:{
        type:String,
        trim:true,
        required:true
    },
    return:{
        type:String,
        required:true,
        trim:true
    },
    size:[
        {
            type:String,
            trim:true
        }
    ],
    model:{
        type:String,
        trim:true
    },
    color:[
        {
            type:String,
            trim:true
        }
    ],
    weight:[
        {
            type:String,
            trim:true
        }
    ],
    description:{
        type:String,
        required:true,
        trim:true
    },
    highlights:{
        type:String,
        required:true,
        trim:true
    },
    tags:[
        {
            type:String
        }
    ],
    price:{
        type:Number,
        required:true
    },
    discountRate: {
        type: Number,//it may b float as well..
        default:0
    },
    videoURL:[{
        type:String
    }],
    isVerified: {
        type: Date,
        default: null
    },
    isRejected: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Date,
        default: null
    },
    isFeatured: {
        type: Date,
        default: null
    },
    viewsCount: {
        type: Number,
        default: 0,
    },
    trendingScore: {
        type: Number,
        default: 0
    },
    noOfSoldOut: {
        type: Number,
        default: 0,
    },
    slug: {
        type: String,
        unique: true
    },
    availableDistricts:[{
        type: String,
        enum: districts,
        required: true
    }],
    remark: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Remark'
    }],




},{
    timestamps:true
})


export const Product = mongoose.models.Product || mongoose.model("Product",productSchema)