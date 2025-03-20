import express from "express"
import { adminFile, adminFileDelete, bankInfo, businessInfo, getAdminProfile, getBankInfo, getBusinessInfo, getNotifications, getWareHouse, profile, readNotification, updateAdminProfile, uploadAdminProfilePhoto, wareHouseInfo } from "../controller/admin";
import { checkAdminSignin, getAdminProfileBytoken } from "../controller/admin_auth";
import { uploadAdminDoc, uploadAdminphoto } from "../middleware/helpers/multer";

export const adminRouter=express.Router();




//notification
adminRouter.get('/notifications/:id',getNotifications)
adminRouter.get('/read-notification/:notification_id/:id',readNotification)

//admin profile

adminRouter.get('/adminprofile/:id',getAdminProfile)
 .put('/updateProfile/:id',checkAdminSignin,updateAdminProfile)
 .post('/uploadProfile/:id',checkAdminSignin, uploadAdminphoto, uploadAdminProfilePhoto)


 adminRouter.get('/admin-profile-by-token',checkAdminSignin,getAdminProfileBytoken)



//admin,s file
adminRouter.post('/businessinfo',checkAdminSignin,businessInfo) //create and update
adminRouter.get('/businessinfo',checkAdminSignin,getBusinessInfo)
adminRouter.post('/adminfile',checkAdminSignin,uploadAdminDoc,adminFile)

adminRouter.delete('/fileremove/:fileId',checkAdminSignin,adminFileDelete)


adminRouter.get('/bankinfo',checkAdminSignin,getBankInfo)
adminRouter.post('/bankinfo',checkAdminSignin,bankInfo)//create and update

adminRouter.get("/warehouse",checkAdminSignin, getWareHouse)
adminRouter.post('/warehouse',checkAdminSignin,wareHouseInfo)//create and update


adminRouter.param('id',profile)