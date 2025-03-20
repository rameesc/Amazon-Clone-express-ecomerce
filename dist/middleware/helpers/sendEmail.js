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
exports.sendEmailFromCustomer = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = (email, sub, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        port: 587,
        auth: {
            user: process.env.ECOM_EMAIL,
            pass: process.env.EMAIL_APP_PASS
        }
    });
    let mailOption = {
        from: process.env.ECOM_EMAIL,
        to: email,
        subject: sub,
        text,
        html
    };
    try {
        yield transporter.sendMail(mailOption);
        return {
            message: "Email sent  successfully",
            success: true
        };
    }
    catch (error) {
        return {
            message: "failed to send email",
            success: false
        };
    }
});
exports.sendEmail = sendEmail;
const sendEmailFromCustomer = (email, sub, text, html) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        port: 587,
        auth: {
            user: process.env.ECOM_EMAIL,
            pass: process.env.EMAIL_APP_PASS
        }
    });
    let mailOption = {
        from: email, //sender emial
        to: process.env.ECOM_EMAIL, //my email and your email
        subject: sub,
        text,
        html
    };
    try {
        yield transporter.sendMail(mailOption);
        return {
            message: "Email sent  successfully",
            success: true
        };
    }
    catch (error) {
        return {
            message: "failed to send email",
            success: false
        };
    }
});
exports.sendEmailFromCustomer = sendEmailFromCustomer;
