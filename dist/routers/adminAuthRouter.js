"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_auth_1 = require("../controller/admin_auth");
exports.adminAuthRouter = express_1.default.Router();
exports.adminAuthRouter.post('/signup', admin_auth_1.signup);
exports.adminAuthRouter.post('/signin', admin_auth_1.signin);
exports.adminAuthRouter.post("/email-verify", admin_auth_1.emailVerifyLink);
exports.adminAuthRouter.post('/forget-password', admin_auth_1.forgetPassword);
exports.adminAuthRouter.post("/rest-password", admin_auth_1.resetPassword);
exports.adminAuthRouter.post("/refresh-token", admin_auth_1.refreshToken);
