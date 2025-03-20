import mongoose from "mongoose";



const pointSchema=new mongoose.Schema({
    type:{
        type:String,
        enum:["point"]
    },
    coordinates:{
        type:[Number]
    }
});


const adminSchema=new mongoose.Schema({

    name:{
        type:String,
        trim:true,
        required:true
    },
    geolocation:{
        type:pointSchema  //of superadmin used to calculate geodistance between user nd the order dispatch system

    },
    shopname:{
        type:String,
        trim:true
    },
    address:{
        type:String,
        trim:true
    },
    shippingRate:{
        type:Number  //added only by superadmin
    },
    shippingCost:{
        type:Number //added only superadmin
    },
    district:{
        type:String,
        trim:true
    },
    muncipality:{
        type:String,
        trim:true
    },
    wardno:{
        type:Number
    },
    businessInfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Businessinfo"
    },
    adminBank:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AdminBank"
    },
    adminWareHouse:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"AdminWareHouse"
    },
    phone:{
        type:Number,
    },
    email:{
        type:String,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    photo:{
        type:String
    },
    holidayMode:{
        start:{
            type:Number
        },
        end:{
            type:Number
        }
    },
    salt:{
        type:String,
    },
    role:{
        type:String,
        enum:["admin","superadmin"],
        default:"admin"
    },
    resetPasswordLink:{
        type:String,
        default:''
    },
    emailVerifyLink: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Date,
        default: null
    },
    isBlocked: {
        type: Date,
        default: null
    }


},{
    timestamps:true
})

export const Admin= mongoose.models.Admin || mongoose.model("Admin",adminSchema);
