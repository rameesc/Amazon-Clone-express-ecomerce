"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_auth_1 = require("../controller/user_auth");
const user_1 = require("../controller/user");
const multer_1 = require("../middleware/helpers/multer");
exports.userRouter = express_1.default.Router();
//address
exports.userRouter.post('/add-address', user_auth_1.auth, user_1.addAddress);
exports.userRouter.put('/edit-address/:addressId', user_auth_1.auth, user_1.editeAddress);
exports.userRouter.get('/address', user_auth_1.auth, user_1.getUserAddres);
exports.userRouter.get('/address/:addressId', user_1.getSingleAddress);
//profile
exports.userRouter.put('/profile/update', user_auth_1.auth, user_1.updateProfile);
exports.userRouter.post('/add/profile', user_auth_1.auth, multer_1.uploadUserPhoto, user_1.uploadUserProfilePhoto);
exports.userRouter.get('/oneProfile/:id', user_1.getProfile);
exports.userRouter.post('/getUser', user_1.getUserByEmail);
exports.userRouter.param('id', user_1.profile);
