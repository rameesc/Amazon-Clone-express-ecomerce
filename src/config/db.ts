import mongoose from "mongoose";


export const dbConnection=async()=>{

    try{
        await mongoose.connect(process.env.DB_URL!)
        console.log("ad successfuly connected")


    }catch(error:unknown){
        console.log("db connection faield")
    }
}

