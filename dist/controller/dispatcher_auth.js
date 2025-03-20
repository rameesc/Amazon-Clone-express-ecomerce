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
exports.dispatchAuth = exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.signin = void 0;
const dispatcher_1 = require("../models/dispatcher");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshTokenModelsSchema_1 = require("../models/refreshTokenModelsSchema");
const sendEmail_1 = require("../middleware/helpers/sendEmail");
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const isDispatch = yield dispatcher_1.Dispatch.findOne({ email });
        if (!isDispatch) {
            res.json({
                message: "Invalid email and password",
                status: false
            });
            return;
        }
        const isPassword = yield bcryptjs_1.default.compare(password, isDispatch === null || isDispatch === void 0 ? void 0 : isDispatch.password);
        if (!isPassword) {
            res.json({
                message: "Invalid email and password",
                status: false
            });
            return;
        }
        const payload = {
            _id: isDispatch._id,
            name: isDispatch.name,
            email: isDispatch.email
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY);
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY);
        yield refreshTokenModelsSchema_1.RefreshToken.create({
            refreshToken
        });
        res.json({ accessToken, refreshToken, status: true, message: "signin" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.signin = signin;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (refreshToken == null) {
            res.json({ message: "Token is null", status: false });
            return;
        }
        let isToken = yield refreshTokenModelsSchema_1.RefreshToken.findOne({ refreshToken });
        if (!isToken) {
            res.json({ message: "Invalid token", status: false });
            return;
        }
        const dispatch = jsonwebtoken_1.default.verify(isToken.refreshToken, process.env.REFRESH_TOKEN_KEY);
        const payload = {
            _id: dispatch._id,
            name: dispatch.name,
            email: dispatch.email
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY);
        res.json({ accessToken, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.refreshToken = refreshToken;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        if (!email) {
            res.json({ message: "email required", status: false });
            return;
        }
        let isDispatch = yield dispatcher_1.Dispatch.findOne({ email });
        if (!isDispatch) {
            res.json({ message: "email does't existing", status: false });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: isDispatch._id }, process.env.JWT_EMAIL_VERIFICATION_KEY, { expiresIn: process.env.EMAIL_TOKEN_EXPIRE_TIME });
        const subject = "Password reset link";
        const text = "Passwotd reset link";
        const html = `
          <p>${isDispatch === null || isDispatch === void 0 ? void 0 : isDispatch.name}</p></br>
          <a href="${process.env.ADMIN_CRM_ROUTE}/reset-password?token=${token}">
          click to reset password
          <a/>
        `;
        const { success } = yield (0, sendEmail_1.sendEmail)(email, subject, text, html);
        if (success) {
            yield isDispatch.updateOne({ resetPasswordLink: token });
            res.json({ message: `Email has been send to ${email} to reset your password `, status: true });
            return;
        }
        res.json({ message: "faield to send email", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resetPasswordLink, newPassword } = req.body;
        const isDispatch = yield dispatcher_1.Dispatch.findOne({ resetPasswordLink });
        if (!isDispatch) {
            res.json({ message: "inValid Link", status: false });
            return;
        }
        const hashPassword = bcryptjs_1.default.hashSync(newPassword, 10);
        const updatefIeld = {
            password: hashPassword,
            resetPasswordLink: ""
        };
        yield dispatcher_1.Dispatch.findByIdAndUpdate(isDispatch._id, updatefIeld);
        res.json({ message: "great! now login with new password", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.resetPassword = resetPassword;
//dispatch authentication middleware
const dispatchAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header("x-auth-token-dispatch");
        if (!token) {
            res.json({ message: "token not found", status: false });
            return;
        }
        const istoken = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_KEY);
        const isDispatch = yield dispatcher_1.Dispatch.findById(istoken === null || istoken === void 0 ? void 0 : istoken._id).select("-password");
        if (!isDispatch) {
            res.json({ message: "user not found invalid token", status: true });
            return;
        }
        req.dispatch = isDispatch;
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
exports.dispatchAuth = dispatchAuth;
