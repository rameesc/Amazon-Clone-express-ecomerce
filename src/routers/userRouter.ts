import express from "express";
import { auth } from "../controller/user_auth";
import { addAddress, editeAddress, getProfile, getSingleAddress, getUserAddres, getUserByEmail, profile, updateProfile, uploadUserProfilePhoto } from "../controller/user";
import { uploadUserPhoto } from "../middleware/helpers/multer";

export const userRouter=express.Router()


//address
userRouter.post('/add-address',auth,addAddress)
userRouter.put('/edit-address/:addressId',auth,editeAddress)
userRouter.get('/address',auth,getUserAddres)
userRouter.get('/address/:addressId',getSingleAddress)
//profile
userRouter.put('/profile/update',auth,updateProfile)
userRouter.post('/add/profile',auth,uploadUserPhoto,uploadUserProfilePhoto)
userRouter.get('/oneProfile/:id',getProfile)

userRouter.post('/getUser',getUserByEmail)

userRouter.param('id',profile)


