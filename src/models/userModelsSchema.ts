import mongoose from "mongoose";



const userSchema=new mongoose.Schema({
    
    name:{
        type:String,
        trim:true,
        required:true,
        
    },
    role:{
        type:String,
        default:"user"

    },
    email:{
        type:String,
        trim:true
    },
    // userId:{
    //     type:String,
    //     trim:true,
    //     unique:true
    // },
    loginDomain:{
        type:String,
        default:"system",
        enum:["system","facebook","google"]
    },
    password:{
        type:String
    },
    location:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"address"
    },
    phone:{
        type:String
    },

    socialPhoto:{
        type:String
    },
    dod:{
        type:String
    },
    gender:{
        type:String,
        enum:["male","female","other"]
    },
    restPasswordLink:{
        type:String,
        default:""
    },
    emailVerifyLink:{
        type:String,
        default:""
    },
    salt:String,
    isBlocked:{
        type:Date,
        default:null
    },
    photo:{
        type:String,
        

    }
},{
    timestamps:true
})

export const User=mongoose.models.User || mongoose.model("User",userSchema)