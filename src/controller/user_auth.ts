
import {NextFunction, Request,Response} from "express"
import { contactValidation, resetPasswordValidate, signupValidate } from "../schema"
import { User } from "../models/userModelsSchema"
import JWT from "jsonwebtoken"
import { sendEmail, sendEmailFromCustomer } from "../middleware/helpers/sendEmail"
import { RefreshToken } from "../models/refreshTokenModelsSchema"
import bcrypt from "bcryptjs"


//if you do not have account signup
export const signup=async(req:Request,res:Response)=>{


    try{
     const {email,password,name}=req.body
   

     const {success,error}=signupValidate.safeParse(req.body)

     

     if(!success){
        res.json({message:error?.errors[0].message,status:false})
        return

     }

     

     const isUser=await User.findOne({email})

     if(isUser){

        res.json({message:"Email is taken!",status:false})
        return
     }
     const hashPassword=await bcrypt.hash(password,10)

     const token =JWT.sign(
        {email},
        process.env.JWT_EMAIL_VERIFICATION_KEY!,
        {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}
     )
    

     await User.create({
        email:email,
        emailVerifyLink:token,
        name:name,
        password:hashPassword

     })
     const subject="Verify email"
     const text="verify email"
     const html=`<p>Hi , ${name} </p></br>
                           <a href="${process.env.CLIENT_URL}/email-verify?token=${token}">Click me to verify email </a> `

    const {success:emailSuccess}=await sendEmail(email,subject,text,html)

    if(emailSuccess){

        res.json({message:"send email to verify email",status:true})
        return
    }
       res.json({message:"failed",status:true})
        return




    }catch(error:unknown){

        if(error instanceof Error){

            if(error.message){

                res.json({
                    message:error?.message,
                    status:false
                })

                return 

            }
        }
    }
}

//verify email link

export const emailVerifyLink =async(req:Request,res:Response)=>{

    try{

        const {token}=req.query

       

        let user=await User.findOne({emailVerifyLink:token})

        if(!user){
            res.json({message:"taken is invalid",status:false})
            return
        }

        

        res.json({
           
            message:"email Verified !",
            status:true})
       
        
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

       

        let user=await User.findOne({email})

       


        if(!user){
            res.json({message:"Email or password is invalid",status:false})
            return


        }
        if(user?.loginDomain=="google"){

            res.json({status:true,message:"login"})
            return
        }

        const isPassword=await bcrypt.compare(password, user.password)

        if(!isPassword){

            res.json({message:"Invalid email and password",status:false})
            return

        }


        // if(!user?.emailVerifyLink){

        //     const token =JWT.sign(
        //         {email},
        //         process.env.JWT_EMAIL_VERIFICATION_KEY!,
        //         {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}
        //      )
            
        
        //     user.emailVerifyLink=token;
        //     await user.save()

        //      const subject="Verify email"
        //      const text="verify email"
        //      const html=`<p>Hi , ${user?.name} </p></br>
        //                            <a href="${process.env.CLIENT_URL}/email-verify?token=${token}">Click me to verify email </a> `
        
        //     const {success:emailSuccess}=await sendEmail(email,subject,text,html)
        
        //     if(emailSuccess){
        
        //         res.json({message:"send email to verify email",status:true})
        //         return
        //     }
        //        res.json({message:"failed",status:true})
        //         return
        

        // }

        if(user?.isBlocked){

            res.json({message:"your account has been blocked",status:false})
            return

        }

        const payload={

            _id:user._id,
            name:user.name,
            email:user.email
        }

        const accessToken =JWT.sign(payload ,process.env.JWT_SIGNIN_KEY! ,{
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        })

        let refreshToken= {
            refreshToken:JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!)
        }
        const refresh=new RefreshToken(refreshToken);
        await refresh.save()


        res.json({accessToken,refreshToken:refreshToken?.refreshToken,status:true,message:"login"})
        user.emailVerifyLink=""
        await user.save();
        return;



    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

//refreshtoken

export  const loginWithGoogle=async(req:Request,res:Response)=>{
    try{

        const {email,name}=req.body;

        const isUser=await User.findOne({email})

        if(isUser){
            res.json({message:"email already taken",status:false})
            return
        }

        const createNewUser=await User.create({
            name,
            email,
            loginDomain:"google"

        })

        const payload={
            _id:createNewUser?._id,
            email:createNewUser?.email,
            role:createNewUser?.role
        }
    
        const accessToken =JWT.sign(payload,process.env.JWT_SIGNIN_KEY!,{
            expiresIn:process.env.SIGNIN_EXPIRE_TIME
        })
        const newRefreshToken=JWT.sign(payload,process.env.REFRESH_TOKEN_KEY!,{
            expiresIn:process.env.REFRESH_TOKEN_EXPIRE
        })

       
        await RefreshToken.create({refreshToken:newRefreshToken})


        const user={
            _id:createNewUser?._id,
            name:createNewUser?.name,
            role:createNewUser?.role,
            email:createNewUser?.email,
            image:createNewUser?.photo,
            accessToken,
            refreshToken:newRefreshToken
        }

        if(createNewUser){
            res.json({user,message:"login",status:true})
            return
        }


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
            email:string
        }

        const payload={
            _id:tokenData?._id ,
            name:tokenData?.name ,
            email:tokenData?.email 
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

        const isEmail=await User.findOne({email,loginDomain:"system"});

        if(!isEmail){
            res.json({email:"user email does,t exist",status:false})
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

        await User.findByIdAndUpdate(isEmail?._id,{
            restPasswordLink:token
        })

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

        let user=await User.findOne({restPasswordLink:resetPasswordLink})

      

        if(!user ){

            res.json({
                message:"Invalid link",
                status:false
            })
            return
        }

        const updatedFields={
            password:newPassword,
            restPasswordLink:''
        }

        await User.findByIdAndUpdate(user._id,updatedFields)


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



export const auth=async(req:Request,res:Response,next:NextFunction)=>{

   

      try{
        const token=req.header("x-auth-token")

        


        if(!token){
            res.json({message:"token not found",status:false})
            return;
        }

       const istoken= JWT.verify(token,process.env.JWT_SIGNIN_KEY!) as {_id:string}

      

        const isUser=await User.findOne({_id:istoken?._id}).select("-password");

        if(!isUser){
            res.json({message:"user not found invalid token",status:true})
            return
        }
        

        req.authUser=isUser
        next()
        return

       
      }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

export const profial=async(req:Request,res:Response)=>{

    try{
        res.json({data:req.authUser})
        return;


    }catch(error:unknown){
        if(error instanceof Error){

            res.json({message:error?.message,status:false})
            return;
        }

    }
}

/// customer sugestion and ideas


export  const ourContact=async(req:Request,res:Response)=>{

    try{

        const {email,subject,message}=req.body

        const {success,error}=contactValidation.safeParse(req.body)


     

        if(!success){
           res.json({message:error?.errors[0].message,status:false})
           return
   
        }
        const html=`<div>
                      <p style="font-weight: bold;">form: ${email}</p>
                      <p style="background-color:white; color: red; padding: 15px;">${message}</p>
                  </div>`

        const {success:emailSuccess,message:emilMessage}=await sendEmailFromCustomer(email,subject,message,html)

        if(emailSuccess){

            res.json({message:emilMessage,status:true})
            return

        }

         res.json({message:emilMessage,status:false})
         return
   

        


    }catch(error:unknown){
        if(error instanceof Error){
            res.json({message:error?.message,status:false})
            return;
        }
    }
}