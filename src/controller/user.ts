import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModelsSchema";

import fs from "fs"
import { Address } from "../models/addressSchema";
import JWT from "jsonwebtoken"
import { RefreshToken } from "../models/refreshTokenModelsSchema";



export const getUserByEmail=async(req:Request,res:Response)=>{


    try{

        const {email}=req.body;

        const isUser=await User.findOne({email})

        if(!isUser){

            res.json({message:"user not found",status:false})
            return
        }

        const payload={
            _id:isUser?._id,
            email:isUser?.email,
            role:isUser?.role
        }
    
        const accessToken =JWT.sign(payload,process.env.JWT_SIGNIN_KEY!,{
            expiresIn:process.env.SIGNIN_EXPIRE_TIME
        })
        const newRefreshToken=JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE
        })

       
        await RefreshToken.create({refreshToken:newRefreshToken})


        const user={
            _id:isUser?._id,
            name:isUser?.name,
            role:isUser?.role,
            email:isUser?.email,
            image:isUser?.photo,
            accessToken,
            refreshToken:newRefreshToken
        }

        

        res.json({user,status:true})
        return


    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }

}

export const profile=async(req:Request,res:Response,next:NextFunction)=>{


    try{
        const {id}=req.params

        const user=await User.findById(id)
        .select("-password -emailVerifyLink -restPasswordLink")
        .populate("location")

        if(!user){

            res.json({message:"user not found"})
            return;

        }
        req.profial=user
        next();

        return

        



    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const getProfile=async(req:Request,res:Response)=>{

    try{

        res.json(req.profial)
        return;


    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const updateProfile=async(req:Request,res:Response)=>{


    try{
        let profial=req.authUser;
        const {newPassword,oldPassword}=req.body


        if(newPassword && oldPassword){

            let user=await User.findOne({email:profial?.email,password:oldPassword})

            if(!user){

                res.json({message:"wrong password"})
                return;
            }

           
        }

        const updateUser=await User.findById(profial?._id,req.body)
        .select("-password -emailVerifyLink -restPasswordLink")

        res.json({updateUser,status:false})
        return
      


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const uploadUserProfilePhoto=async(req:Request,res:Response)=>{

    try{
        let profile =req.authUser

        if(typeof req.file=="undefined"){
            res.json({message:"image required"})
            return;
        }

        const {filename}=req.file


         if(profile?.photo=='' || profile?.photo==undefined){

            fs.unlink(`/public/uploads/user/${filename}`,(err)=>{

                if(err){
                    res.json({message:"failed to upload"})

                }
            })

         }
            
            
      

       const updateProfile= await User.findByIdAndUpdate(profile?._id,{
            photo:filename
        })

        res.json({photo:updateProfile.photo,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const addAddress=async(req:Request,res:Response)=>{

    let profile=req.authUser;

    try{

        if(!profile){
            res.json({message:"unautherized user",status:false})
            return
        }

        const {
            city,
            area,
            label,
            address,
            phone,
            state,
            pinCode,
            country

        }=req.body;

        if(!label){
            res.json({message:"address label undefined",status:false})
            return
        }

        if(!address){
            res.json({message:"address  undefined",status:false})
            return

        }
        if(!city){
            res.json({message:"city  undefined",status:false})
            return

        }
        if(!area){
            res.json({message:"area undefined",status:false})
            return

        }
        if(!phone){
            res.json({message:"phone undefined",status:false})
            return

        }
        await Address.create({
            address,
            area,
            label,
            phone,
            isActive:Date.now(),
            city,
            state,
            country,
            pinCode,
            user:profile?._id
        })

        res.json({message:"added successfuly ",status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

export const getUserAddres=async(req:Request,res:Response)=>{

    try{

        const userAddress=await Address.find({user:req?.authUser?._id}).limit(2).sort({createdAt:"descending"})

        res.json({address:userAddress,status:true})
        return


    }catch(error:unknown){
        
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }

}

export const getSingleAddress=async(req:Request,res:Response)=>{

    try{

        const {addressId}=req.params


        const isAddress=await Address.findOne({_id:addressId})

        if(!isAddress){

            res.json({message:"address not found",status:false})
            return
        }

        res.json({address:isAddress,status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const editeAddress=async(req:Request,res:Response)=>{


    try{

        const {addressId}=req.params

       
        const {
            city,
            area,
            label,
            address,
            phone,
            

        }=req.body;
      

        const isAddress=await Address.findOne({_id:addressId});



        if(!isAddress){
            res.json({message:"address not found",status:false});
            return
        }

        if(!label){
            res.json({message:"address label undefined",status:false})
            return
        }

        if(!address){
            res.json({message:"address  undefined",status:false})
            return

        }
        if(!city){
            res.json({message:"city  undefined",status:false})
            return

        }
        if(!area){
            res.json({message:"area undefined",status:false})
            return

        }
        if(!phone){
            res.json({message:"phone undefined",status:false})
            return

        }

        await Address.findByIdAndUpdate(addressId,req.body)


        res.json({message:"successfuly updated",status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

//get all user for super admin


export const getAllCustomer=async(req:Request,res:Response)=>{


    try{

        const page=Number(req.query.page)-1
        const prePage=10

        const query={
            isBlocked:null
        }

        const allUser=await User.find(query)
         .skip(prePage*page)
         .limit(prePage)

         const totalCount=allUser.length

         const pagination=Math.ceil(totalCount/prePage)

         res.json({user:allUser,pagination,totalCount,status:true})
         return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }

}
