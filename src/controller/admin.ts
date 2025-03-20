import { NextFunction, Request, Response } from "express";
import { Admin } from "../models/adminschema";
import fs from "fs"
import { Adminfile } from "../models/adminfile";
import { Businessinfo } from "../models/business-info";
import { AdminBank } from "../models/adminBank";
import { AdminWareHouse } from "../models/AdminWareHouse";
import { Notification } from "../models/notification";
import { NotificationProp } from "../types/types";
import { bankInfoValidation, businessInfoValidation, wareHouseInfoValidation } from "../schema";

import path from "path"


export const profile=async(req:Request,res:Response,next:NextFunction)=>{


    try{

        const {id}=req.params

        const isAdmin=await Admin.findById(id).select('-password -resetPasswordLink -emailVerifyLink')
              .populate("businessInfo")
              .populate("adminBank")
              .populate("adminWareHouse")
        if(!isAdmin){
            res.json({message:"admin not found with this id",status:false})
            return;
        }
        
        req.adminProfile=isAdmin
        next()


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }
    }
}

export const getAdminProfile=async(req:Request,res:Response)=>{

    try{
       

        res.json({profile:req.adminProfile,status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }
    }
}

export const updateAdminProfile=async(req:Request,res:Response)=>{


    try{

        let profile=req.adminProfile;

        const {
            email,
            shopname,
            address,
            shippingRate,
            shippingCost,
            district,
            muncipality,
            wardno,
            phone,
            holidayMode
        }=req.body;

        console.log(req.body)

        const isAdmin=await Admin.findById(profile._id);

        if(!isAdmin){
            res.json({message:"admin not found",status:false})
            return
        }

        if(email){
            res.json({message:"email can not be update",status:false})
            return;
        }

        if(!shopname){
            res.json({message:"shopname can not be update",status:false})
            return;

        }
        if(!address){
            res.json({message:" address can not be update",status:false})
            return;

        }
        
        if(!district){
            res.json({message:" district can not be update",status:false})
            return;

        }
        if(!muncipality){
            res.json({message:" district can not be update",status:false})
            return;

        }
        if(!wardno){
            res.json({message:"wardno can not be update",status:false})
            return;

        }
        if(!phone){
            res.json({message:"phone can not be update",status:false})
            return;

        }
        if(!holidayMode){
            res.json({message:"holidayMode can not be update",status:false})
            return;

        }

        const payload={
            isVerified:null,
            isBlocked:null,
            ...req.body
        }

        await Admin.findByIdAndUpdate(isAdmin._id,payload)

        res.json({message:"successfully updated",status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }
    }
}

export const uploadAdminProfilePhoto=async(req:Request,res:Response)=>{

    try{
        let profile =req.adminProfile

       

        if(req.file==undefined){
            res.json({message:"image required"})
            return;
        }

        const {filename,path,destination}=req.file

       
         
    

         if(profile?.photo=='' || profile?.photo==undefined){

            fs.unlinkSync(`public/uploads/admin/${filename}`)

         }

        
            
            
         

       const updateProfile= await Admin.findByIdAndUpdate(profile?._id,{
            photo:filename
        })

        res.json({message:"photo uploaded",photo:updateProfile.photo,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


type MyQuery={
    filetype:string
}

export const adminFile=async(req:Request<{},{},{},MyQuery>,res:Response)=>{

    try{

        const {filetype}=req.query;

        console.log(filetype)

        const profile=req.admin

        if(req.file==undefined){
            res.json({message:"image of adminfile is required",status:false})
            return
        }

        

       if(filetype!=="citizenship" && filetype!=="bank" && filetype!=="businessLicence"){
        
          res.json({message:"Invalid file type",status:false})
          return;

       }

       const {filename,path,destination}=req.file

       console.log(filename)


       await Adminfile.create({
         fileUrl:filename,
         admin:profile._id
       })

       res.json({message:"successfully upload file",status:true})
       return;



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const adminFileDelete=async(req:Request,res:Response)=>{

    try{

        const {filetype}=req.query;

       

        const profile=req.admin
       
        if(!profile){

            res.json({message:"unautherized admin",status:false})
            return
        }
        

        

       if(filetype!=="citizenship" && filetype!=="bank" && filetype!=="businessLicence"){
        
          res.json({message:"Invalid file type",status:false})
          return;

       }

      const isFile= await Adminfile.findById(req.params.fileId) 
      


      if(!isFile){

        res.json({message:"file not found",status:false})
       return;

      }
      //const filePath = path.resolve('public', 'uploads', 'admin', isFile.fileUrl);
      
      

      await fs.unlinkSync(`public/uploads/admin/${isFile?.fileUrl}`)

      await Adminfile.findByIdAndDelete(req.params.fileId)

       


     

       res.json({message:"successfully file removed",status:true})
       return;



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}
export const getBusinessInfo=async(req:Request,res:Response)=>{

    try{
        const profile=req.admin

        let businessInfo=await Businessinfo.findOne({admin:profile._id})
        .populate("businessLicence")
        .populate("citizenshipBack")
        .populate("citizenshipFront")

        if(!businessInfo){
            res.json({message:"No business information.",status:false})
            return;
        }
        res.json({businessInfo,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

export const businessInfo=async(req:Request,res:Response)=>{

    try{
        const profile=req.admin;

       const {success,data,error}= businessInfoValidation.safeParse(req.body)

       console.log(error)

        if(!success){
            res.json({message:error?.errors[0].message,status:false})
            return
    
         }

        const isAdmin= await Businessinfo.findOne({admin:profile._id})


        if(isAdmin){

            const businessInfo= await Businessinfo.findByIdAndUpdate(isAdmin._id,req.body)

            await Admin.findByIdAndUpdate(profile._id,{
                businessInfo:businessInfo?._id
    
            })

           res.json({message:"update business info ",status:true})
           return;
        }


       const businessInfo= await Businessinfo.create({
            admin:profile._id,
            ...req.body
        })

        await Admin.findByIdAndUpdate(profile._id,{
            businessInfo:businessInfo?._id

        })

        res.json({message:"businessinfo created ",status:true})
        return;

       



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

export const getBankInfo=async(req:Request,res:Response)=>{


    try{
        const profile=req.admin

        let bankInfo=await AdminBank.findOne({admin:profile._id})
        .populate("chequeCopy")

        if(!bankInfo){

            res.json({message:"No bank information",status:false})
            return;
        }

        res.json({bankInfo,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const bankInfo=async(req:Request,res:Response)=>{

    try{
        const profile=req.admin;

       const {success,data,error}= bankInfoValidation.safeParse(req.body)

       console.log(error)

        if(!success){
            res.json({message:error?.errors[0].message})
            return
    
         }

        const isAdmin= await AdminBank.findOne({admin:profile._id})


        if(isAdmin){

            const bankInfo=  await AdminBank.findByIdAndUpdate(isAdmin._id,req.body)

            await Admin.findByIdAndUpdate(profile._id,{
                adminBank:bankInfo?._id
                
    
            })

           res.json({message:"update bank info ",status:true})
           return;
        }


       const bankInfo= await AdminBank.create({
            admin:profile._id,
            ...req.body
        })
        await Admin.findByIdAndUpdate(profile._id,{
            adminBank:bankInfo?._id

        })

        res.json({message:"bankinfo created ",status:true})
        return;

       



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

export const getWareHouse=async(req:Request,res:Response)=>{

    try{
        const profile=req.admin;

      let wareHouseInfo = await AdminWareHouse.findOne({admin:profile._id})

      if(!wareHouseInfo){

        res.json({message:"No wareHouse informatiom",status:false})
        return
      }
      res.json({wareHouseInfo,status:true})
      return;



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const wareHouseInfo=async(req:Request,res:Response)=>{

    try{
        const profile=req.admin;

        console.log(req.body)

       const {success,data,error}= wareHouseInfoValidation.safeParse(req.body)

       console.log(error)

        if(!success){
            res.json({message:error?.errors[0].message})
            return
    
         }

        const isAdmin= await AdminWareHouse.findOne({admin:profile._id})


        if(isAdmin){

            const wareHouse= await AdminWareHouse.findByIdAndUpdate(isAdmin._id,req.body)

            await Admin.findByIdAndUpdate(profile._id,{
                adminWareHouse:wareHouse?._id
    
            })

           res.json({message:"update warehouse info ",status:true})
           return;
        }


       const wareHouse= await AdminWareHouse.create({
            admin:profile._id,
            ...req.body
        })

        await Admin.findByIdAndUpdate(profile._id,{
            adminWareHouse:wareHouse?._id

        })

        res.json({message:"warehouse info created ",status:true})
        return;

       



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}


export const getNotifications=async(req:Request,res:Response)=>{


    try{
        const profile=req.admin;

        let adminNotification=await Notification.findOne({admin:profile._id});

        if(adminNotification){

            adminNotification.noOfUnseen=0;
            await  adminNotification.save()

            res.json({adminNotification,status:true})
            return;


        }
        adminNotification={
            admin:profile._id,
            notifications:[],
            noOfUnseen:0
        }

        res.json({adminNotification,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}

export const readNotification=async(req:Request,res:Response)=>{

    try{
        const profile=req.adminProfile

        let adminNotification=await Notification.findOne({admin:profile._id})

        if(adminNotification){
            adminNotification.notifications=adminNotification.notifications.map((n:NotificationProp)=>{
                if(n._id.toString()==req.notification_id){

                    n.notifications.map((i)=>{

                        i.hasRead=true
                    })
                    return n
                }
            })
            await adminNotification.save();
            res.json({adminNotification,status:true})
            return
        }
        adminNotification={
            admin:profile._id,
            notifications:[],
            noOfUnseen:0
        }

        res.json({adminNotification,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }


    }
}