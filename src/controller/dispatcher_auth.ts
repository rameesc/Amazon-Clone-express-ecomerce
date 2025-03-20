import { NextFunction, Request, Response } from "express";
import { Dispatch } from "../models/dispatcher";
import bcrypt  from "bcryptjs"
import JWT from "jsonwebtoken"
import { RefreshToken } from "../models/refreshTokenModelsSchema";
import { sendEmail } from "../middleware/helpers/sendEmail";







export const signin= async(req:Request,res:Response)=>{

    try{

        const {email,password}=req.body;

        const isDispatch= await Dispatch.findOne({email})

        if(!isDispatch){

            res.json({
                message:"Invalid email and password",
                status:false
            })
            return
        }
      const isPassword=await  bcrypt.compare(password,isDispatch?.password)

      if(!isPassword){

        res.json({
            message:"Invalid email and password",
            status:false
        })
        return

      }


      const payload={
        _id:isDispatch._id,
        name:isDispatch.name,
        email:isDispatch.email
      }


      const accessToken = JWT.sign(
          payload,
          process.env.REFRESH_TOKEN_KEY!
        )
      const refreshToken = JWT.sign(
          payload,
          process.env.REFRESH_TOKEN_KEY!
        )

        await RefreshToken.create({
            refreshToken

        })

        res.json({accessToken,refreshToken,status:true,message:"signin"})
        return
    





    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }
    }
}


export const refreshToken=async(req:Request,res:Response)=>{

    try{
        const {refreshToken}=req.body;

        if(refreshToken==null){

            res.json({message:"Token is null",status:false})
            return
        }

        let isToken= await RefreshToken.findOne({refreshToken})


        if(!isToken){

            res.json({message:"Invalid token",status:false})
            return
        }

        const dispatch=  JWT.verify(
             isToken.refreshToken,
             process.env.REFRESH_TOKEN_KEY!
            ) as {
                _id:string,
                name:string,
                email:string
            }

        const payload={
            _id:dispatch._id,
            name:dispatch.name,
            email:dispatch.email

        }

        const accessToken=JWT.sign(payload , process.env.REFRESH_TOKEN_KEY!)

        res.json({accessToken,status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }

    }
}

export const forgotPassword =async(req:Request,res:Response)=>{

    try{
        const {email}=req.body;

        if(!email){
            res.json({message:"email required",status:false})
            return
        }

        let isDispatch=await Dispatch.findOne({email})

        if(!isDispatch){

            res.json({message:"email does't existing",status:false})
            return
        }

        const token =JWT.sign(
            {_id:isDispatch._id},
            process.env.JWT_EMAIL_VERIFICATION_KEY!,
            {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME!}
        )

        const subject="Password reset link"
        const text="Passwotd reset link"
        const html =`
          <p>${isDispatch?.name}</p></br>
          <a href="${process.env.ADMIN_CRM_ROUTE}/reset-password?token=${token}">
          click to reset password
          <a/>
        `

        const {success}=await sendEmail(email,subject,text,html)


        if(success){
           await isDispatch.updateOne({ resetPasswordLink:token})

           res.json({message:`Email has been send to ${email} to reset your password `,status:true})
           return



        }

        res.json({message:"faield to send email",status:false})
        return

    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }

    }
}


export const resetPassword=async(req:Request,res:Response)=>{


    try{
        const { resetPasswordLink, newPassword } = req.body;

        const isDispatch=await Dispatch.findOne({resetPasswordLink})


        if(!isDispatch){

            res.json({message:"inValid Link",status:false})
            return

        }

        const hashPassword=bcrypt.hashSync(newPassword,10);

        const updatefIeld={
            password:hashPassword,
            resetPasswordLink:""

        }

        await Dispatch.findByIdAndUpdate(
            isDispatch._id,
            updatefIeld
        )

        res.json({message:"great! now login with new password",status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return;
        }

    }
}

//dispatch authentication middleware

export const dispatchAuth=async(req:Request,res:Response,next:NextFunction)=>{

   

    try{
      const token=req.header("x-auth-token-dispatch")


      if(!token){
          res.json({message:"token not found",status:false})
          return;
      }

     const istoken= JWT.verify(token,process.env.REFRESH_TOKEN_KEY!) as {_id:string}

      const isDispatch=await Dispatch.findById(istoken?._id).select("-password");

      if(!isDispatch){
          res.json({message:"user not found invalid token",status:true})
          return
      }

      req.dispatch=isDispatch
      next()
      return

     
    }catch(error:unknown){
      if(error instanceof Error){

          res.json({message:error?.message,status:false})
          return;
      }

  }
}