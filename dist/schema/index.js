"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactValidation = exports.dispatcherValidate = exports.wareHouseInfoValidation = exports.bankInfoValidation = exports.businessInfoValidation = exports.resetPasswordValidate = exports.signInValidate = exports.signupValidate = void 0;
const z = __importStar(require("zod"));
exports.signupValidate = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
        message: "password must be 6 character"
    }),
    name: z.string().min(3),
});
exports.signInValidate = z.object({
    password: z.string().min(6, {
        message: "password must be 6 character"
    }),
    email: z.string().email(),
});
exports.resetPasswordValidate = z.object({
    password: z.string().min(6, {
        message: "password must be 6 character"
    }),
});
exports.businessInfoValidation = z.object({
    ownerName: z.string().min(3, {
        message: "ownerName must be string and minimam 3 character"
    }),
    address: z.string().min(5, {
        message: " address must be string and minimam 5 character"
    }),
    city: z.string({
        message: " city must be string "
    }),
    citizenshipNumber: z.string({
        message: "citizenshipNumber must be number "
    }),
    businessRegisterNumber: z.string({
        message: "businessRegisterNumber must be number "
    }),
});
exports.bankInfoValidation = z.object({
    accountHolder: z.string().min(3, {
        message: "accountHolder must be string and minimam 3 character"
    }),
    bankname: z.string().min(3, {
        message: "bankname must be string and minimam 3 character"
    }),
    branchName: z.string().min(3, {
        message: "branchName must be string and minimam 3 character"
    }),
    accoundNumber: z.string().min(3, {
        message: "accoundNumber must be string and minimam 3 character"
    }),
    routingNumber: z.string().min(3, {
        message: "routingNumber must be string and minimam 3 character"
    }),
});
exports.wareHouseInfoValidation = z.object({
    name: z.string().min(3, {
        message: "name must be string minimam 3 character"
    }),
    address: z.string().min(3, {
        message: "address must be string minimam 3 character"
    }),
    phone: z.string().min(3, {
        message: "phone must be string minimam 3 character"
    }),
    city: z.string().min(3, {
        message: "city must be string minimam 3 character"
    }),
});
exports.dispatcherValidate = z.object({
    email: z.string().email(),
    password: z.string().min(6, {
        message: "password must be 6 character"
    }),
    name: z.string().min(3, {
        message: "name must be string minimam 3 character"
    }),
});
exports.contactValidation = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    subject: z.string().min(6),
    message: z.string().min(6)
});
