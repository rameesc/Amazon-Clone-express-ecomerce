
import * as z from "zod"



export const signupValidate=z.object({
    email:z.string().email(),
    password:z.string().min(6,{
        message:"password must be 6 character"
    }),
    name:z.string().min(3),
})
export const signInValidate=z.object({
  
    password:z.string().min(6,{
        message:"password must be 6 character"
    }),
    email:z.string().email(),
})

export const resetPasswordValidate=z.object({
    password:z.string().min(6,{
        message:"password must be 6 character"
    }),
})

export const businessInfoValidation=z.object({


     ownerName:z.string().min(3,{
        message:"ownerName must be string and minimam 3 character"
     }),
     address:z.string().min(5,{
         message:" address must be string and minimam 5 character"
     }),
     city:z.string({
        message:" city must be string "
     }),
     citizenshipNumber:z.string({
        message:"citizenshipNumber must be number "
     }),
     businessRegisterNumber:z.string({
        message:"businessRegisterNumber must be number "
     }),


})

export const bankInfoValidation=z.object({

    accountHolder:z.string().min(3,{
        message:"accountHolder must be string and minimam 3 character"
    }),
    bankname:z.string().min(3,{
        message:"bankname must be string and minimam 3 character"
    }),
    branchName:z.string().min(3,{
        message:"branchName must be string and minimam 3 character"
    }),
    accoundNumber:z.string().min(3,{
        message:"accoundNumber must be string and minimam 3 character"
    }),
    routingNumber:z.string().min(3,{
        message:"routingNumber must be string and minimam 3 character"
    }),

})

export const wareHouseInfoValidation=z.object({
   
    name:z.string().min(3,{
        message:"name must be string minimam 3 character"
    }),
    address:z.string().min(3,{
        message:"address must be string minimam 3 character"
    }),
    phone:z.string().min(3,{
        message:"phone must be string minimam 3 character"
    }),
    city:z.string().min(3,{
        message:"city must be string minimam 3 character"
    }),
})


export const dispatcherValidate=z.object({

    email:z.string().email(),
    
    password:z.string().min(6,{
        message:"password must be 6 character"
    }),
    name:z.string().min(3,{
        message:"name must be string minimam 3 character"
    }),
})

export const contactValidation=z.object({
    name:z.string().min(2),
    email:z.string().email(),
    subject:z.string().min(6),
    message:z.string().min(6)
})
