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
exports.ourContact = exports.profial = exports.auth = exports.resetPassword = exports.forgetPassword = exports.refreshToken = exports.loginWithGoogle = exports.signin = exports.emailVerifyLink = exports.signup = void 0;
const schema_1 = require("../schema");
const userModelsSchema_1 = require("../models/userModelsSchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../middleware/helpers/sendEmail");
const refreshTokenModelsSchema_1 = require("../models/refreshTokenModelsSchema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
//if you do not have account signup
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        const { success, error } = schema_1.signupValidate.safeParse(req.body);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message, status: false });
            return;
        }
        const isUser = yield userModelsSchema_1.User.findOne({ email });
        if (isUser) {
            res.json({ message: "Email is taken!", status: false });
            return;
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, 10);
        const token = jsonwebtoken_1.default.sign({ email }, process.env.JWT_EMAIL_VERIFICATION_KEY, { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_TIME });
        yield userModelsSchema_1.User.create({
            email,
            emailVerifyLink: token,
            name,
            password: hashPassword
        });
        const subject = "Verify email";
        const text = "verify email";
        const html = `<p>Hi , ${name} </p></br>
                           <a href="${process.env.CLIENT_URL}/email-verify?token=${token}">Click me to verify email </a> `;
        const { success: emailSuccess } = yield (0, sendEmail_1.sendEmail)(email, subject, text, html);
        if (emailSuccess) {
            res.json({ message: "send email to verify email", status: true });
            return;
        }
        res.json({ message: "failed", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message) {
            }
        }
    }
});
exports.signup = signup;
//verify email link
const emailVerifyLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.query;
        let user = yield userModelsSchema_1.User.findOne({ emailVerifyLink: token });
        if (!user) {
            res.json({ message: "taken is invalid", status: false });
            return;
        }
        res.json({
            message: "email Verified !",
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
exports.emailVerifyLink = emailVerifyLink;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        let user = yield userModelsSchema_1.User.findOne({ email });
        if (!user) {
            res.json({ message: "Email or password is invalid", status: false });
            return;
        }
        if ((user === null || user === void 0 ? void 0 : user.loginDomain) == "google") {
            res.json({ status: true, message: "login" });
            return;
        }
        const isPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPassword) {
            res.json({ message: "Invalid email and password", status: false });
            return;
        }
        // if(!user?.emailVerifyLink){
        //     const token =JWT.sign(
        //         {email},
        //         process.env.JWT_EMAIL_VERIFICATION_KEY!,
        //         {expiresIn:process.env.EMAIL_TOKEN_EXPIRE_TIME}
        //      )
        //     user.emailVerifyLink=token;
        //     await user.save()
        //      const subject="Verify email"
        //      const text="verify email"
        //      const html=`<p>Hi , ${user?.name} </p></br>
        //                            <a href="${process.env.CLIENT_URL}/email-verify?token=${token}">Click me to verify email </a> `
        //     const {success:emailSuccess}=await sendEmail(email,subject,text,html)
        //     if(emailSuccess){
        //         res.json({message:"send email to verify email",status:true})
        //         return
        //     }
        //        res.json({message:"failed",status:true})
        //         return
        // }
        if (user === null || user === void 0 ? void 0 : user.isBlocked) {
            res.json({ message: "your account has been blocked", status: false });
            return;
        }
        const payload = {
            _id: user._id,
            name: user.name,
            email: user.email
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        let refreshToken = {
            refreshToken: jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY)
        };
        const refresh = new refreshTokenModelsSchema_1.RefreshToken(refreshToken);
        yield refresh.save();
        res.json({ accessToken, refreshToken: refreshToken === null || refreshToken === void 0 ? void 0 : refreshToken.refreshToken, status: true, message: "login" });
        user.emailVerifyLink = "";
        yield user.save();
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
//refreshtoken
const loginWithGoogle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name } = req.body;
        const isUser = yield userModelsSchema_1.User.findOne({ email });
        if (isUser) {
            res.json({ message: "email already taken", status: false });
            return;
        }
        const createNewUser = yield userModelsSchema_1.User.create({
            name,
            email,
            loginDomain: "google"
        });
        const payload = {
            _id: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser._id,
            email: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.email,
            role: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        const newRefreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        });
        yield refreshTokenModelsSchema_1.RefreshToken.create({ refreshToken: newRefreshToken });
        const user = {
            _id: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser._id,
            name: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.name,
            role: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.role,
            email: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.email,
            image: createNewUser === null || createNewUser === void 0 ? void 0 : createNewUser.photo,
            accessToken,
            refreshToken: newRefreshToken
        };
        if (createNewUser) {
            res.json({ user, message: "login", status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.loginWithGoogle = loginWithGoogle;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        let isrefreshToken = yield refreshTokenModelsSchema_1.RefreshToken.findOne({ refreshToken });
        if (!isrefreshToken) {
            res.json({ message: "Invalid refreshToken", status: false });
            return;
        }
        let tokenData = jsonwebtoken_1.default.verify(isrefreshToken === null || isrefreshToken === void 0 ? void 0 : isrefreshToken.refreshToken, process.env.REFRESH_TOKEN_KEY);
        const payload = {
            _id: tokenData === null || tokenData === void 0 ? void 0 : tokenData._id,
            name: tokenData === null || tokenData === void 0 ? void 0 : tokenData.name,
            email: tokenData === null || tokenData === void 0 ? void 0 : tokenData.email
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
        const isEmail = yield userModelsSchema_1.User.findOne({ email, loginDomain: "system" });
        if (!isEmail) {
            res.json({ email: "user email does,t exist", status: false });
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
            yield userModelsSchema_1.User.findByIdAndUpdate(isEmail === null || isEmail === void 0 ? void 0 : isEmail._id, {
                restPasswordLink: token
            });
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
        let user = yield userModelsSchema_1.User.findOne({ restPasswordLink: resetPasswordLink });
        if (!user) {
            res.json({
                message: "Invalid link",
                status: false
            });
            return;
        }
        const updatedFields = {
            password: newPassword,
            restPasswordLink: ''
        };
        yield userModelsSchema_1.User.findByIdAndUpdate(user._id, updatedFields);
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
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("x-auth-token");
        if (!token) {
            res.json({ message: "token not found", status: false });
            return;
        }
        const istoken = jsonwebtoken_1.default.verify(token, process.env.JWT_SIGNIN_KEY);
        const isUser = yield userModelsSchema_1.User.findOne({ _id: istoken === null || istoken === void 0 ? void 0 : istoken._id }).select("-password");
        if (!isUser) {
            res.json({ message: "user not found invalid token", status: true });
            return;
        }
        req.authUser = isUser;
        next();
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.auth = auth;
const profial = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ data: req.authUser });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.profial = profial;
/// customer sugestion and ideas
const ourContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, subject, message } = req.body;
        const { success, error } = schema_1.contactValidation.safeParse(req.body);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message, status: false });
            return;
        }
        const html = `<div>
                      <p style="font-weight: bold;">form: ${email}</p>
                      <p style="background-color:white; color: red; padding: 15px;">${message}</p>
                  </div>`;
        const { success: emailSuccess, message: emilMessage } = yield (0, sendEmail_1.sendEmailFromCustomer)(email, subject, message, html);
        if (emailSuccess) {
            res.json({ message: emilMessage, status: true });
            return;
        }
        res.json({ message: emilMessage, status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.ourContact = ourContact;
