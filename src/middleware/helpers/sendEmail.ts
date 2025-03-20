

import nodeMailer from "nodemailer"



export const sendEmail=async(email:string,sub:string,text:string,html:string)=>{

    const transporter=nodeMailer.createTransport({
        service:"gmail",
        port:587,
        auth:{
            user:process.env.ECOM_EMAIL,
            pass:process.env.EMAIL_APP_PASS
        }
    });

    let mailOption={
        from:process.env.ECOM_EMAIL,
        to:email,
        subject:sub,
        text,
        html
    }

    try{

        await transporter.sendMail(mailOption)

        return {
            message:"Email sent  successfully",
            success:true
        }

    }catch(error:unknown){

        return {
            message:"failed to send email",
            success:false
        }
    }

}
export const sendEmailFromCustomer=async(email:string,sub:string,text:string,html:string)=>{

    const transporter=nodeMailer.createTransport({
        service:"gmail",
        port:587,
        auth:{
            user:process.env.ECOM_EMAIL,
            pass:process.env.EMAIL_APP_PASS
        }
    });

    let mailOption={
        from:email,//sender emial
        to:process.env.ECOM_EMAIL, //my email and your email
        subject:sub,
        text,
        html
    }

    try{

        await transporter.sendMail(mailOption)

        return {
            message:"Email sent  successfully",
            success:true
        }

    }catch(error:unknown){

        return {
            message:"failed to send email",
            success:false
        }
    }

}