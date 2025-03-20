import mongoose from "mongoose";




const notificationSchema=new mongoose.Schema({

    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    notifications:[{
        notificationType:String,
        notificationDetail:Object,
        hasRead:{
            type:Boolean,
            default:false
        },
        date:{
            type:Date
        }
    }],
    noOfUnseen:{
        type:Number,
        default:0
    }



},{
    timestamps:true
})


export const Notification=mongoose.models.Notification || mongoose.model("Notification",notificationSchema);

