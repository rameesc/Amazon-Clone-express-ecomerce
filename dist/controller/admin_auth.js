"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.isSuperadmin = exports.hasAuthorization = exports.getAdminProfileBytoken = exports.checkAdminSignin = exports.resetPassword = exports.forgetPassword = exports.refreshToken = exports.signin = exports.emailVerifyLink = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const schema_1 = require("../schema");
const adminschema_1 = require("../models/adminschema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../middleware/helpers/sendEmail");
const refreshTokenModelsSchema_1 = require("../models/refreshTokenModelsSchema");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const { success, error } = schema_1.signupValidate.safeParse(req.body);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message, status: false });
            return;
        }
        const isAdmin = yield adminschema_1.Admin.findOne({ email });
        if (isAdmin) {
            res.json({ message: "email is taken", status: false });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        const token = jsonwebtoken_1.default.sign({ email }, process.env.JWT_EMAIL_VERIFICATION_KEY, { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_TIME });
        yield adminschema_1.Admin.create({
            email,
            name,
            password: hashPassword,
            emailVerifyLink: token
        });
        const subject = "Verify email";
        const text = "verify email";
        const html = `<p>Hi , ${name} </p></br>
                           <a href="${process.env.ADMIN_CRM_ROUTE}/email-verify?token=${token}">Click me to verify email ${process.env.ADMIN_CRM_ROUTE}</a> `;
        const { success: emailSuccess } = yield (0, sendEmail_1.sendEmail)(email, subject, text, html);
        if (emailSuccess) {
            res.json({ message: `send email verify  to ${email}`, status: true });
            return;
        }
        res.json({ message: "failed", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.signup = signup;
const emailVerifyLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        let isAdmin = yield adminschema_1.Admin.findOne({ emailVerifyLink: token });
        if (!isAdmin) {
            res.json({ message: "token is invalid", status: false });
            return;
        }
        const payload = {
            _id: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin._id,
            name: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.name,
            email: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.email,
            role: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        let refreshToken = {
            refreshToken: jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY)
        };
        const refresh = new refreshTokenModelsSchema_1.RefreshToken(refreshToken);
        yield refresh.save();
        res.json({
            accessToken,
            refreshToken: refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.refreshToken,
            status: true,
            message: "Successfully Email verified!"
        });
        isAdmin.emailVerifyLink = "";
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.emailVerifyLink = emailVerifyLink;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const { success, error } = schema_1.signInValidate.safeParse(req.body);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message });
            return;
        }
        let isAdmin = yield adminschema_1.Admin.findOne({ email });
        if (!isAdmin) {
            res.json({ message: "Invalid email", status: false });
            return;
        }
        const isPassword = yield bcryptjs_1.default.compare(password, isAdmin.password);
        if (!isPassword) {
            res.json({ message: "Invalid email and password", status: false });
            return;
        }
        console.log(process.env.ADMIN_CRM_ROUTE);
        if (!(isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.emailVerifyLink)) {
            const token = jsonwebtoken_1.default.sign({ email }, process.env.JWT_EMAIL_VERIFICATION_KEY, { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_TIME });
            isAdmin.emailVerifyLink = token;
            yield isAdmin.save();
            const subject = "Verify email";
            const text = "verify email";
            const html = `<p>Hi , ${isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.name} </p></br>
                                   <a href="${process.env.ADMIN_CRM_ROUTE}/email-verify?token=${token}">Click me to verify email </a> `;
            const { success: emailSuccess } = yield (0, sendEmail_1.sendEmail)(email, subject, text, html);
            if (emailSuccess) {
                res.json({ message: "send email to verify email", status: true });
                return;
            }
            res.json({ message: "failed", status: true });
            return;
        }
        if (isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.isBlocked) {
            res.json({ message: "your account has been blocked", status: false });
            return;
        }
        const payload = {
            _id: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin._id,
            name: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.name,
            email: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.email,
            role: isAdmin === null || isAdmin === void 0 ? void 0 : isAdmin.role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        let refreshToken = {
            refreshToken: jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY)
        };
        const refresh = new refreshTokenModelsSchema_1.RefreshToken(refreshToken);
        yield refresh.save();
        res.json({
            accessToken,
            refreshToken: refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.refreshToken,
            status: true,
            message: "login"
        });
        isAdmin.emailVerifyLink = "";
        yield isAdmin.save();
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.signin = signin;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        let isrefreshToken = yield refreshTokenModelsSchema_1.RefreshToken.findOne({ refreshToken });
        if (!isrefreshToken) {
            res.json({ message: "Invalid refreshToken", status: false });
            return;
        }
        let tokenData = jsonwebtoken_1.default.verify(isrefreshToken === null || isrefreshToken === void 0 ? void 0 : isrefreshToken.refreshToken, process.env.REFRESH_TOKEN_KEY);
        if (tokenData.role !== 'admin' && tokenData.role !== 'superadmin') {
            res.json({ message: "Invalid refresh token", status: false });
            return;
        }
        const payload = {
            _id: tokenData === null || tokenData === void 0 ? void 0 : tokenData._id,
            name: tokenData === null || tokenData === void 0 ? void 0 : tokenData.name,
            email: tokenData === null || tokenData === void 0 ? void 0 : tokenData.email,
            role: tokenData.role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        const newRefreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        });
        // isrefreshToken=newRefreshToken
        yield refreshTokenModelsSchema_1.RefreshToken.findByIdAndUpdate(isrefreshToken === null || isrefreshToken === void 0 ? void 0 : isrefreshToken._id, {
            refreshToken: newRefreshToken
        });
        res.json({
            accessToken,
            refreshToken: newRefreshToken,
            status: true
        });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.refreshToken = refreshToken;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.json({
                message: "no email in request body",
                status: false
            });
            return;
        }
        const isEmail = yield adminschema_1.Admin.findOne({ email });
        if (!isEmail) {
            res.json({ message: "user email does,t exist", status: false });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: isEmail._id }, process.env.JWT_EMAIL_VERIFICATION_KEY, { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_TIME });
        const subject = "Password reset Link";
        const text = 'password reset link';
        const html = `<p>Hi ,${isEmail.name} </p> </br>
        <a href="${process.env.CLIENT_URL}/reset-password?token=${token}">
        Click me to reset your password</a>
        `;
        const status = yield (0, sendEmail_1.sendEmail)(isEmail.email, subject, text, html);
        if (status === null || status === void 0 ? void 0 : status.success) {
            isEmail.resetPasswordLink = token;
            yield isEmail.save();
            res.json({
                message: `Email has been to ${isEmail.email}. Follow the instruction to reset your password`,
                status: true
            });
            return;
        }
        res.json({ message: "faield to send email", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.forgetPassword = forgetPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetPasswordLink, newPassword } = req.body;
        const { success, error } = schema_1.resetPasswordValidate.safeParse({ password: newPassword });
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message });
            return;
        }
        let isAdmin = yield adminschema_1.Admin.findOne({ resetPasswordLink });
        if (!isAdmin) {
            res.json({
                message: "Invalid link",
                status: false
            });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const updatedFields = {
            password: hashPassword,
            restPasswordLink: ''
        };
        yield adminschema_1.Admin.findByIdAndUpdate(isAdmin._id, updatedFields);
        res.json({
            message: "great Now you can login with your new password.",
            status: true
        });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.resetPassword = resetPassword;
const checkAdminSignin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("x-auth-token-admin");
        if (!token) {
            res.json({ message: "token not found", status: false });
            return;
        }
        const istoken = jsonwebtoken_1.default.verify(token, process.env.JWT_SIGNIN_KEY);
        const isAdmin = yield adminschema_1.Admin.findById(istoken === null || istoken === void 0 ? void 0 : istoken._id).select("-password");
        if (!isAdmin) {
            res.json({ message: "user not found invalid token", status: true });
            return;
        }
        req.admin = isAdmin;
        next();
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.checkAdminSignin = checkAdminSignin;
const getAdminProfileBytoken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ profile: req.admin, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getAdminProfileBytoken = getAdminProfileBytoken;
const hasAuthorization = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sameAdmin = req.profial && req.admin && req.profial._id.toString() === req.admin._id.toString();
        const superadmin = req.admin && req.admin.role == "superadmin";
        const canAccess = superadmin || sameAdmin;
        if (canAccess) {
            next();
            return;
        }
        res.json({ message: "Unauthorized admin", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.hasAuthorization = hasAuthorization;
const isSuperadmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isSuperadmin = req.admin && req.admin.role == "superadmin";
        if (isSuperadmin) {
            next();
            return;
        }
        res.json({ message: 'Unauthorized admin', status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.isSuperadmin = isSuperadmin;
const isAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAdmin = req.admin && req.admin.role == 'admin';
        if (isAdmin) {
            next();
            return;
        }
        res.json({ message: 'Unauthorized admin', status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.isAdmin = isAdmin;
