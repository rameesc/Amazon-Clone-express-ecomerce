
import bcrypt from "bcryptjs"
import { NextFunction, Request, Response } from "express"
import { resetPasswordValidate, signupValidate ,signInValidate} from "../schema"
import { Admin } from "../models/adminschema";
import JWT from "jsonwebtoken"
import { sendEmail } from "../middleware/helpers/sendEmail";
import { RefreshToken } from "../models/refreshTokenModelsSchema";
import dotenv from "dotenv"

dotenv.config()

export const signup =async(req:Request,res:Response)=>{

    try{
        const {name,email,password}=req.body

       const {success,error}= signupValidate.safeParse(req.body);

       if(!success){
        res.json({message:error?.errors[0].message,status:false})
        return

       }

     const isAdmin=await  Admin.findOne({email})

     if(isAdmin){

        res.json({message:"email is taken",status:false})
        return
     }

    const hashPassword=await bcrypt.hash(password,10)

    const token =JWT.sign(
        {email},
        process.env.JWT_EMAIL_VERIFICATION_KEY!,
        {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}
     )

     await  Admin.create({
        email,
        name,
        password:hashPassword,
        emailVerifyLink:token

     })

     const subject="Verify email"
     const text="verify email"
     const html=`<p>Hi , ${name} </p></br>
                           <a href="${process.env.ADMIN_CRM_ROUTE}/email-verify?token=${token}">Click me to verify email ${process.env.ADMIN_CRM_ROUTE}</a> `

    const {success:emailSuccess}=await sendEmail(email,subject,text,html)

    if(emailSuccess){

        res.json({message:`send email verify  to ${email}`,status:true})
        return
    }
       res.json({message:"failed",status:false})
        return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;

        }
    }
}


export const emailVerifyLink =async(req:Request,res:Response)=>{

    try{

        const {token}=req.query

       

        let isAdmin=await Admin.findOne({emailVerifyLink:token})

        if(!isAdmin){
            res.json({message:"token is invalid",status:false})
            return
        }

        const payload={

            _id:isAdmin?._id,
            name:isAdmin?.name,
            email:isAdmin?.email,
            role:isAdmin?.role
        }

        const accessToken =JWT.sign(payload ,process.env.JWT_SIGNIN_KEY! ,{
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        })

        let refreshToken= {
            refreshToken:JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!)
        }
        const refresh=new RefreshToken(refreshToken);
        await refresh.save()


        res.json({
            accessToken,
            refreshToken:refreshToken?.refreshToken,
            status:true,
            message:"Successfully Email verified!"
        })
        isAdmin.emailVerifyLink=""
       
        return;


    }catch(error:unknown){
        
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }
        
    }
}




export const signin=async(req:Request,res:Response)=>{

    try{

        const {email,password}=req.body;
       


        const {success,error}=signInValidate.safeParse(req.body)

           

        if(!success){
           res.json({message:error?.errors[0].message})
           return
   
        }
       

        let isAdmin=await Admin.findOne({email})

        if(!isAdmin){

            res.json({message:"Invalid email",status:false})
            return
        }


        const isPassword=await bcrypt.compare(password, isAdmin.password)

        if(!isPassword){

            res.json({message:"Invalid email and password",status:false})
            return

        }
        
        console.log(process.env.ADMIN_CRM_ROUTE)

      

        if(!isAdmin?.emailVerifyLink){

            const token =JWT.sign(
                {email},
                process.env.JWT_EMAIL_VERIFICATION_KEY!,
                {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}
             )
            
        
            isAdmin.emailVerifyLink=token;
            await isAdmin.save()

             const subject="Verify email"
             const text="verify email"
             const html=`<p>Hi , ${isAdmin?.name} </p></br>
                                   <a href="${process.env.ADMIN_CRM_ROUTE}/email-verify?token=${token}">Click me to verify email </a> `
        
            const {success:emailSuccess}=await sendEmail(email,subject,text,html)
        
            if(emailSuccess){
        
                res.json({message:"send email to verify email",status:true})
                return
            }
               res.json({message:"failed",status:true})
                return
        

        }

        if(isAdmin?.isBlocked){

            res.json({message:"your account has been blocked",status:false})
            return

        }

        const payload={

            _id:isAdmin?._id,
            name:isAdmin?.name,
            email:isAdmin?.email,
            role:isAdmin?.role
        }

        const accessToken =JWT.sign(payload ,process.env.JWT_SIGNIN_KEY! ,{
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        })

        let refreshToken= {
            refreshToken:JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!)
        }
        const refresh=new RefreshToken(refreshToken);
        await refresh.save()


        res.json({
            accessToken,
            refreshToken:refreshToken?.refreshToken,
            status:true,
            message:"login"
        })
        isAdmin.emailVerifyLink=""
        await isAdmin.save();
        return;



    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}


export const refreshToken=async(req:Request,res:Response)=>{

    try{

        const {refreshToken}=req.body;

        let isrefreshToken= await RefreshToken.findOne({refreshToken})

   


        if(!isrefreshToken){
            res.json({message:"Invalid refreshToken",status:false})
            return
        }

        let  tokenData=JWT.verify(
            isrefreshToken?.refreshToken,
            process.env.REFRESH_TOKEN_KEY!
        ) as {
            _id:string,
            name:string,
            email:string,
            role:string
        }

        if(tokenData.role!=='admin' && tokenData.role!=='superadmin'){

            res.json({message:"Invalid refresh token",status:false})
            return;
        }

        const payload={
            _id:tokenData?._id ,
            name:tokenData?.name ,
            email:tokenData?.email ,
            role:tokenData.role
        }

        const accessToken =JWT.sign(payload,process.env.JWT_SIGNIN_KEY!,{
            expiresIn:process.env.SIGNIN_EXPIRE_TIME
        })
        const newRefreshToken=JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE
        })

        // isrefreshToken=newRefreshToken
        await RefreshToken.findByIdAndUpdate(isrefreshToken?._id,{
            refreshToken:newRefreshToken

        }) 


        res.json({
            accessToken,
            refreshToken:newRefreshToken,
            status:true
        })
        return


    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}


export const forgetPassword=async(req:Request,res:Response)=>{

    try{

        const {email}=req.body;

        if(!email){

            res.json({
                message:"no email in request body",
                status:false
            })
            return;
        }

        const isEmail=await Admin.findOne({email});

        if(!isEmail){
            res.json({message:"user email does,t exist",status:false})
            return;
        }

        const token=JWT.sign(
            {_id:isEmail._id},
            process.env.JWT_EMAIL_VERIFICATION_KEY!,

            {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}

        )

        const subject="Password reset Link";

        const text='password reset link'

        const html=`<p>Hi ,${isEmail.name} </p> </br>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">
        Click me to reset your password</a>
        `

       const status=await sendEmail(isEmail.email,subject,text,html)


       if(status?.success){


        isEmail.resetPasswordLink=token
        await isEmail.save()

       

        res.json({
            message:`Email has been to ${isEmail.email}. Follow the instruction to reset your password`,
            status:true
        })

        return;



       }
       res.json({message:"faield to send email",status:false})
       return



    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}



export const resetPassword=async(req:Request,res:Response)=>{

    try{

        const {
            resetPasswordLink,
            newPassword

        }=req.body
        
      

       const {success,error}= resetPasswordValidate.safeParse({password:newPassword})

        if(!success){
            res.json({message:error?.errors[0].message})
            return
    
         }

        let isAdmin=await Admin.findOne({resetPasswordLink})
      

        if(!isAdmin ){

            res.json({
                message:"Invalid link",
                status:false
            })
            return
        }
        const hashPassword=await bcrypt.hash(newPassword,10)

        const updatedFields={
            password:hashPassword,
            restPasswordLink:''
        }

        await Admin.findByIdAndUpdate(isAdmin._id,updatedFields)


        res.json({
            message:"great Now you can login with your new password.",
            status:true
        })
        return



    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}



export const checkAdminSignin=async(req:Request,res:Response,next:NextFunction)=>{

   

    try{
      const token=req.header("x-auth-token-admin")


      if(!token){
          res.json({message:"token not found",status:false})
          return;
      }

     const istoken= JWT.verify(token,process.env.JWT_SIGNIN_KEY!) as {_id:string}

      const isAdmin=await Admin.findById(istoken?._id).select("-password");

      
    

      if(!isAdmin){
          res.json({message:"user not found invalid token",status:true})
          return
      }

      req.admin=isAdmin
      next()
      return

     
    }catch(error:unknown){
      if(error instanceof Error){


          res.status(401).json({message:error?.message,status:false})
          return;
      }

  }
}

export const getAdminProfileBytoken=async(req:Request,res:Response)=>{

    try{

        res.json({profile:req.admin,status:true})
        return

    }catch(error:unknown){
      if(error instanceof Error){

          res.json({message:error?.message,status:false})
          return;
      }

    }
}

export const hasAuthorization=async(req:Request,res:Response,next:NextFunction)=>{


    try{

        const sameAdmin=req.profial  && req.admin && req.profial._id.toString()===req.admin._id.toString()
        const superadmin =req.admin && req.admin.role=="superadmin"

        const canAccess =superadmin || sameAdmin;

        if(canAccess){
            next()
            return
        }

        res.json({message:"Unauthorized admin",status:false})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const isSuperadmin=async(req:Request,res:Response,next:NextFunction)=>{

    try{

        const isSuperadmin=req.admin && req.admin.role=="superadmin";

        if(isSuperadmin){
            next();
            return
        }

        res.json({message:'Unauthorized admin',status:false});
        return;

    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const isAdmin=async(req:Request,res:Response,next:NextFunction)=>{

    try{

        const isAdmin=req.admin && req.admin.role=='admin';

        if(isAdmin){
            next();
            return
        }

        res.json({message:'Unauthorized admin',status:false});
        return;

    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}