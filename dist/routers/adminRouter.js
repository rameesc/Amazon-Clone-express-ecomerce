"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_1 = require("../controller/admin");
const admin_auth_1 = require("../controller/admin_auth");
const multer_1 = require("../middleware/helpers/multer");
exports.adminRouter = express_1.default.Router();
//notification
exports.adminRouter.get('/notifications/:id', admin_1.getNotifications);
exports.adminRouter.get('/read-notification/:notification_id/:id', admin_1.readNotification);
//admin profile
exports.adminRouter.get('/adminprofile/:id', admin_1.getAdminProfile)
    .put('/updateProfile/:id', admin_auth_1.checkAdminSignin, admin_1.updateAdminProfile)
    .post('/uploadProfile/:id', admin_auth_1.checkAdminSignin, multer_1.uploadAdminphoto, admin_1.uploadAdminProfilePhoto);
exports.adminRouter.get('/admin-profile-by-token', admin_auth_1.checkAdminSignin, admin_auth_1.getAdminProfileBytoken);
//admin,s file
exports.adminRouter.post('/businessinfo', admin_auth_1.checkAdminSignin, admin_1.businessInfo); //create and update
exports.adminRouter.get('/businessinfo', admin_auth_1.checkAdminSignin, admin_1.getBusinessInfo);
exports.adminRouter.post('/adminfile', admin_auth_1.checkAdminSignin, multer_1.uploadAdminDoc, admin_1.adminFile);
exports.adminRouter.delete('/fileremove/:fileId', admin_auth_1.checkAdminSignin, admin_1.adminFileDelete);
exports.adminRouter.get('/bankinfo', admin_auth_1.checkAdminSignin, admin_1.getBankInfo);
exports.adminRouter.post('/bankinfo', admin_auth_1.checkAdminSignin, admin_1.bankInfo); //create and update
exports.adminRouter.get("/warehouse", admin_auth_1.checkAdminSignin, admin_1.getWareHouse);
exports.adminRouter.post('/warehouse', admin_auth_1.checkAdminSignin, admin_1.wareHouseInfo); //create and update
exports.adminRouter.param('id', admin_1.profile);
