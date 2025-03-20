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
exports.getAllCustomer = exports.editeAddress = exports.getSingleAddress = exports.getUserAddres = exports.addAddress = exports.uploadUserProfilePhoto = exports.updateProfile = exports.getProfile = exports.profile = exports.getUserByEmail = void 0;
const userModelsSchema_1 = require("../models/userModelsSchema");
const fs_1 = __importDefault(require("fs"));
const addressSchema_1 = require("../models/addressSchema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const refreshTokenModelsSchema_1 = require("../models/refreshTokenModelsSchema");
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const isUser = yield userModelsSchema_1.User.findOne({ email });
        if (!isUser) {
            res.json({ message: "user not found", status: false });
            return;
        }
        const payload = {
            _id: isUser === null || isUser === void 0 ? void 0 : isUser._id,
            email: isUser === null || isUser === void 0 ? void 0 : isUser.email,
            role: isUser === null || isUser === void 0 ? void 0 : isUser.role
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SIGNIN_KEY, {
            expiresIn: process.env.SIGNIN_EXPIRE_TIME
        });
        const newRefreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_KEY, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE
        });
        yield refreshTokenModelsSchema_1.RefreshToken.create({ refreshToken: newRefreshToken });
        const user = {
            _id: isUser === null || isUser === void 0 ? void 0 : isUser._id,
            name: isUser === null || isUser === void 0 ? void 0 : isUser.name,
            role: isUser === null || isUser === void 0 ? void 0 : isUser.role,
            email: isUser === null || isUser === void 0 ? void 0 : isUser.email,
            image: isUser === null || isUser === void 0 ? void 0 : isUser.photo,
            accessToken,
            refreshToken: newRefreshToken
        };
        res.json({ user, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getUserByEmail = getUserByEmail;
const profile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userModelsSchema_1.User.findById(id)
            .select("-password -emailVerifyLink -restPasswordLink")
            .populate("location");
        if (!user) {
            res.json({ message: "user not found" });
            return;
        }
        req.profial = user;
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
exports.profile = profile;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(req.profial);
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let profial = req.authUser;
        const { newPassword, oldPassword } = req.body;
        if (newPassword && oldPassword) {
            let user = yield userModelsSchema_1.User.findOne({ email: profial === null || profial === void 0 ? void 0 : profial.email, password: oldPassword });
            if (!user) {
                res.json({ message: "wrong password" });
                return;
            }
        }
        const updateUser = yield userModelsSchema_1.User.findById(profial === null || profial === void 0 ? void 0 : profial._id, req.body)
            .select("-password -emailVerifyLink -restPasswordLink");
        res.json({ updateUser, status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.updateProfile = updateProfile;
const uploadUserProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let profile = req.authUser;
        if (typeof req.file == "undefined") {
            res.json({ message: "image required" });
            return;
        }
        const { filename } = req.file;
        if ((profile === null || profile === void 0 ? void 0 : profile.photo) == '' || (profile === null || profile === void 0 ? void 0 : profile.photo) == undefined) {
            fs_1.default.unlink(`/public/uploads/user/${filename}`, (err) => {
                if (err) {
                    res.json({ message: "failed to upload" });
                }
            });
        }
        const updateProfile = yield userModelsSchema_1.User.findByIdAndUpdate(profile === null || profile === void 0 ? void 0 : profile._id, {
            photo: filename
        });
        res.json({ photo: updateProfile.photo, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.uploadUserProfilePhoto = uploadUserProfilePhoto;
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let profile = req.authUser;
    try {
        if (!profile) {
            res.json({ message: "unautherized user", status: false });
            return;
        }
        const { city, area, label, address, phone, state, pinCode, country } = req.body;
        if (!label) {
            res.json({ message: "address label undefined", status: false });
            return;
        }
        if (!address) {
            res.json({ message: "address  undefined", status: false });
            return;
        }
        if (!city) {
            res.json({ message: "city  undefined", status: false });
            return;
        }
        if (!area) {
            res.json({ message: "area undefined", status: false });
            return;
        }
        if (!phone) {
            res.json({ message: "phone undefined", status: false });
            return;
        }
        yield addressSchema_1.Address.create({
            address,
            area,
            label,
            phone,
            isActive: Date.now(),
            city,
            state,
            country,
            pinCode,
            user: profile === null || profile === void 0 ? void 0 : profile._id
        });
        res.json({ message: "added successfuly ", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.addAddress = addAddress;
const getUserAddres = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userAddress = yield addressSchema_1.Address.find({ user: (_a = req === null || req === void 0 ? void 0 : req.authUser) === null || _a === void 0 ? void 0 : _a._id }).limit(2).sort({ createdAt: "descending" });
        res.json({ address: userAddress, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getUserAddres = getUserAddres;
const getSingleAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { addressId } = req.params;
        const isAddress = yield addressSchema_1.Address.findOne({ _id: addressId });
        if (!isAddress) {
            res.json({ message: "address not found", status: false });
            return;
        }
        res.json({ address: isAddress, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getSingleAddress = getSingleAddress;
const editeAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { addressId } = req.params;
        const { city, area, label, address, phone, } = req.body;
        const isAddress = yield addressSchema_1.Address.findOne({ _id: addressId });
        if (!isAddress) {
            res.json({ message: "address not found", status: false });
            return;
        }
        if (!label) {
            res.json({ message: "address label undefined", status: false });
            return;
        }
        if (!address) {
            res.json({ message: "address  undefined", status: false });
            return;
        }
        if (!city) {
            res.json({ message: "city  undefined", status: false });
            return;
        }
        if (!area) {
            res.json({ message: "area undefined", status: false });
            return;
        }
        if (!phone) {
            res.json({ message: "phone undefined", status: false });
            return;
        }
        yield addressSchema_1.Address.findByIdAndUpdate(addressId, req.body);
        res.json({ message: "successfuly updated", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.editeAddress = editeAddress;
//get all user for super admin
const getAllCustomer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const prePage = 10;
        const query = {
            isBlocked: null
        };
        const allUser = yield userModelsSchema_1.User.find(query)
            .skip(prePage * page)
            .limit(prePage);
        const totalCount = allUser.length;
        const pagination = Math.ceil(totalCount / prePage);
        res.json({ user: allUser, pagination, totalCount, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getAllCustomer = getAllCustomer;
