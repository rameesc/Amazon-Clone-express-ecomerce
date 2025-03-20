"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const express_1 = __importDefault(require("express"));
const user_auth_1 = require("../controller/user_auth");
const user_1 = require("../controller/user");
const admin_auth_1 = require("../controller/admin_auth");
exports.userAuth = express_1.default.Router();
exports.userAuth.post(`/signup`, user_auth_1.signup);
exports.userAuth.post("/emailverify", user_auth_1.emailVerifyLink);
exports.userAuth.post('/signin', user_auth_1.signin);
exports.userAuth.post('/google', user_auth_1.loginWithGoogle);
exports.userAuth.post('/refreshtoken', user_auth_1.refreshToken);
exports.userAuth.post('/forgetpassword', user_auth_1.forgetPassword);
exports.userAuth.post('/resetpassword', user_auth_1.resetPassword);
exports.userAuth.get('/profial', user_auth_1.auth, user_auth_1.profial);
exports.userAuth.get('/getAllUser', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, user_1.getAllCustomer);
exports.userAuth.post('/check', user_auth_1.auth);
//contact
exports.userAuth.post('/contact', user_auth_1.ourContact);
