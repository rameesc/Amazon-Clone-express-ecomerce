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
exports.readNotification = exports.getNotifications = exports.wareHouseInfo = exports.getWareHouse = exports.bankInfo = exports.getBankInfo = exports.businessInfo = exports.getBusinessInfo = exports.adminFileDelete = exports.adminFile = exports.uploadAdminProfilePhoto = exports.updateAdminProfile = exports.getAdminProfile = exports.profile = void 0;
const adminschema_1 = require("../models/adminschema");
const fs_1 = __importDefault(require("fs"));
const adminfile_1 = require("../models/adminfile");
const business_info_1 = require("../models/business-info");
const adminBank_1 = require("../models/adminBank");
const AdminWareHouse_1 = require("../models/AdminWareHouse");
const notification_1 = require("../models/notification");
const schema_1 = require("../schema");
const profile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const isAdmin = yield adminschema_1.Admin.findById(id).select('-password -resetPasswordLink -emailVerifyLink')
            .populate("businessInfo")
            .populate("adminBank")
            .populate("adminWareHouse");
        if (!isAdmin) {
            res.json({ message: "admin not found with this id", status: false });
            return;
        }
        req.adminProfile = isAdmin;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.profile = profile;
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json({ profile: req.adminProfile, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getAdminProfile = getAdminProfile;
const updateAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let profile = req.adminProfile;
        const { email, shopname, address, shippingRate, shippingCost, district, muncipality, wardno, phone, holidayMode } = req.body;
        console.log(req.body);
        const isAdmin = yield adminschema_1.Admin.findById(profile._id);
        if (!isAdmin) {
            res.json({ message: "admin not found", status: false });
            return;
        }
        if (email) {
            res.json({ message: "email can not be update", status: false });
            return;
        }
        if (!shopname) {
            res.json({ message: "shopname can not be update", status: false });
            return;
        }
        if (!address) {
            res.json({ message: " address can not be update", status: false });
            return;
        }
        if (!district) {
            res.json({ message: " district can not be update", status: false });
            return;
        }
        if (!muncipality) {
            res.json({ message: " district can not be update", status: false });
            return;
        }
        if (!wardno) {
            res.json({ message: "wardno can not be update", status: false });
            return;
        }
        if (!phone) {
            res.json({ message: "phone can not be update", status: false });
            return;
        }
        if (!holidayMode) {
            res.json({ message: "holidayMode can not be update", status: false });
            return;
        }
        const payload = Object.assign({ isVerified: null, isBlocked: null }, req.body);
        yield adminschema_1.Admin.findByIdAndUpdate(isAdmin._id, payload);
        res.json({ message: "successfully updated", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.updateAdminProfile = updateAdminProfile;
const uploadAdminProfilePhoto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let profile = req.adminProfile;
        if (req.file == undefined) {
            res.json({ message: "image required" });
            return;
        }
        const { filename, path, destination } = req.file;
        if ((profile === null || profile === void 0 ? void 0 : profile.photo) == '' || (profile === null || profile === void 0 ? void 0 : profile.photo) == undefined) {
            fs_1.default.unlinkSync(`public/uploads/admin/${filename}`);
        }
        const updateProfile = yield adminschema_1.Admin.findByIdAndUpdate(profile === null || profile === void 0 ? void 0 : profile._id, {
            photo: filename
        });
        res.json({ message: "photo uploaded", photo: updateProfile.photo, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.uploadAdminProfilePhoto = uploadAdminProfilePhoto;
const adminFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filetype } = req.query;
        console.log(filetype);
        const profile = req.admin;
        if (req.file == undefined) {
            res.json({ message: "image of adminfile is required", status: false });
            return;
        }
        if (filetype !== "citizenship" && filetype !== "bank" && filetype !== "businessLicence") {
            res.json({ message: "Invalid file type", status: false });
            return;
        }
        const { filename, path, destination } = req.file;
        console.log(filename);
        yield adminfile_1.Adminfile.create({
            fileUrl: filename,
            admin: profile._id
        });
        res.json({ message: "successfully upload file", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.adminFile = adminFile;
const adminFileDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filetype } = req.query;
        const profile = req.admin;
        if (!profile) {
            res.json({ message: "unautherized admin", status: false });
            return;
        }
        if (filetype !== "citizenship" && filetype !== "bank" && filetype !== "businessLicence") {
            res.json({ message: "Invalid file type", status: false });
            return;
        }
        const isFile = yield adminfile_1.Adminfile.findById(req.params.fileId);
        if (!isFile) {
            res.json({ message: "file not found", status: false });
            return;
        }
        //const filePath = path.resolve('public', 'uploads', 'admin', isFile.fileUrl);
        yield fs_1.default.unlinkSync(`public/uploads/admin/${isFile === null || isFile === void 0 ? void 0 : isFile.fileUrl}`);
        yield adminfile_1.Adminfile.findByIdAndDelete(req.params.fileId);
        res.json({ message: "successfully file removed", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.adminFileDelete = adminFileDelete;
const getBusinessInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        let businessInfo = yield business_info_1.Businessinfo.findOne({ admin: profile._id })
            .populate("businessLicence")
            .populate("citizenshipBack")
            .populate("citizenshipFront");
        if (!businessInfo) {
            res.json({ message: "No business information.", status: false });
            return;
        }
        res.json({ businessInfo, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getBusinessInfo = getBusinessInfo;
const businessInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        const { success, data, error } = schema_1.businessInfoValidation.safeParse(req.body);
        console.log(error);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message, status: false });
            return;
        }
        const isAdmin = yield business_info_1.Businessinfo.findOne({ admin: profile._id });
        if (isAdmin) {
            const businessInfo = yield business_info_1.Businessinfo.findByIdAndUpdate(isAdmin._id, req.body);
            yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
                businessInfo: businessInfo === null || businessInfo === void 0 ? void 0 : businessInfo._id
            });
            res.json({ message: "update business info ", status: true });
            return;
        }
        const businessInfo = yield business_info_1.Businessinfo.create(Object.assign({ admin: profile._id }, req.body));
        yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
            businessInfo: businessInfo === null || businessInfo === void 0 ? void 0 : businessInfo._id
        });
        res.json({ message: "businessinfo created ", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.businessInfo = businessInfo;
const getBankInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        let bankInfo = yield adminBank_1.AdminBank.findOne({ admin: profile._id })
            .populate("chequeCopy");
        if (!bankInfo) {
            res.json({ message: "No bank information", status: false });
            return;
        }
        res.json({ bankInfo, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getBankInfo = getBankInfo;
const bankInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        const { success, data, error } = schema_1.bankInfoValidation.safeParse(req.body);
        console.log(error);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message });
            return;
        }
        const isAdmin = yield adminBank_1.AdminBank.findOne({ admin: profile._id });
        if (isAdmin) {
            const bankInfo = yield adminBank_1.AdminBank.findByIdAndUpdate(isAdmin._id, req.body);
            yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
                adminBank: bankInfo === null || bankInfo === void 0 ? void 0 : bankInfo._id
            });
            res.json({ message: "update bank info ", status: true });
            return;
        }
        const bankInfo = yield adminBank_1.AdminBank.create(Object.assign({ admin: profile._id }, req.body));
        yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
            adminBank: bankInfo === null || bankInfo === void 0 ? void 0 : bankInfo._id
        });
        res.json({ message: "bankinfo created ", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.bankInfo = bankInfo;
const getWareHouse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        let wareHouseInfo = yield AdminWareHouse_1.AdminWareHouse.findOne({ admin: profile._id });
        if (!wareHouseInfo) {
            res.json({ message: "No wareHouse informatiom", status: false });
            return;
        }
        res.json({ wareHouseInfo, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getWareHouse = getWareHouse;
const wareHouseInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        console.log(req.body);
        const { success, data, error } = schema_1.wareHouseInfoValidation.safeParse(req.body);
        console.log(error);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message });
            return;
        }
        const isAdmin = yield AdminWareHouse_1.AdminWareHouse.findOne({ admin: profile._id });
        if (isAdmin) {
            const wareHouse = yield AdminWareHouse_1.AdminWareHouse.findByIdAndUpdate(isAdmin._id, req.body);
            yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
                adminWareHouse: wareHouse === null || wareHouse === void 0 ? void 0 : wareHouse._id
            });
            res.json({ message: "update warehouse info ", status: true });
            return;
        }
        const wareHouse = yield AdminWareHouse_1.AdminWareHouse.create(Object.assign({ admin: profile._id }, req.body));
        yield adminschema_1.Admin.findByIdAndUpdate(profile._id, {
            adminWareHouse: wareHouse === null || wareHouse === void 0 ? void 0 : wareHouse._id
        });
        res.json({ message: "warehouse info created ", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.wareHouseInfo = wareHouseInfo;
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.admin;
        let adminNotification = yield notification_1.Notification.findOne({ admin: profile._id });
        if (adminNotification) {
            adminNotification.noOfUnseen = 0;
            yield adminNotification.save();
            res.json({ adminNotification, status: true });
            return;
        }
        adminNotification = {
            admin: profile._id,
            notifications: [],
            noOfUnseen: 0
        };
        res.json({ adminNotification, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.getNotifications = getNotifications;
const readNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const profile = req.adminProfile;
        let adminNotification = yield notification_1.Notification.findOne({ admin: profile._id });
        if (adminNotification) {
            adminNotification.notifications = adminNotification.notifications.map((n) => {
                if (n._id.toString() == req.notification_id) {
                    n.notifications.map((i) => {
                        i.hasRead = true;
                    });
                    return n;
                }
            });
            yield adminNotification.save();
            res.json({ adminNotification, status: true });
            return;
        }
        adminNotification = {
            admin: profile._id,
            notifications: [],
            noOfUnseen: 0
        };
        res.json({ adminNotification, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.readNotification = readNotification;
