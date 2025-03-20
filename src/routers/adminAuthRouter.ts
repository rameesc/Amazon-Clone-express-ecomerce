
import express from "express"

import { 
    emailVerifyLink,
    forgetPassword, 
    refreshToken,
    resetPassword,
    signin,
    signup } from "../controller/admin_auth";

export const adminAuthRouter=express.Router();


adminAuthRouter.post('/signup',signup)
adminAuthRouter.post('/signin',signin)
adminAuthRouter.post("/email-verify",emailVerifyLink)
adminAuthRouter.post('/forget-password',forgetPassword);
adminAuthRouter.post("/rest-password",resetPassword)
adminAuthRouter.post("/refresh-token",refreshToken)



