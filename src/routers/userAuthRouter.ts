
import express from "express"
import { 
    auth, 
    emailVerifyLink, 
    forgetPassword, 
    loginWithGoogle, 
    ourContact, 
    profial, 
    refreshToken, 
    resetPassword, 
    signin, 
    signup } from "../controller/user_auth"
import { getAllCustomer } from "../controller/user"
import { checkAdminSignin, isSuperadmin } from "../controller/admin_auth"


export const userAuth=express.Router()


userAuth.post("/signup",signup)
userAuth.post("/emailverify",emailVerifyLink)
userAuth.post('/signin',signin)
userAuth.post('/google',loginWithGoogle)
userAuth.post('/refreshtoken',refreshToken);
userAuth.post('/forgetpassword',forgetPassword)
userAuth.post('/resetpassword',resetPassword)
userAuth.get('/profial',auth,profial)
userAuth.get('/getAllUser',checkAdminSignin,isSuperadmin, getAllCustomer)

userAuth.post('/check',auth)

//contact
userAuth.post('/contact',ourContact)




