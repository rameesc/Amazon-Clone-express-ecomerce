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
exports.getProductBrands = exports.productBrandItems = exports.getProduct = exports.disApproveProduct = exports.approveProduct = exports.toggleProductFeatured = exports.flipCategoryAvailablity = exports.getSingleCategory = exports.getCategory = exports.category = exports.getUser = exports.blockUnblockUser = exports.blockUnblockAdminAccount = exports.flipAdminAccountApproval = exports.flipAdminWareHouseApprovel = exports.flipAdminBankApprovel = exports.flipAdminBusinessApproval = exports.blockUnbolckDispatcher = exports.editeDispatch = exports.addDispatcher = exports.getAllDispatchers = exports.getSingleAdmin = exports.getAdmins = exports.addLead = exports.getDeletedBanners = exports.getBanners = exports.deleteBanner = exports.editeBanner = exports.banner = exports.getShippingData = exports.shippingData = exports.getGeoLocation = exports.geoLocation = void 0;
const adminschema_1 = require("../models/adminschema");
const Product_1 = require("../models/Product");
const fs_1 = __importDefault(require("fs"));
const banner_1 = require("../models/banner");
const Lead_1 = require("../models/Lead");
const dispatcher_1 = require("../models/dispatcher");
const schema_1 = require("../schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const business_info_1 = require("../models/business-info");
const adminBank_1 = require("../models/adminBank");
const AdminWareHouse_1 = require("../models/AdminWareHouse");
const userModelsSchema_1 = require("../models/userModelsSchema");
const Category_1 = require("../models/Category");
const suggestKeyword_1 = require("../models/suggestKeyword");
const districts_1 = require("../models/districts");
const Remark_1 = require("../models/Remark");
const productBrand_1 = require("../models/productBrand");
const fileRemover_1 = require("../middleware/helpers/fileRemover");
const geoLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let superadmin = req.admin;
        const { lat, long } = req.body;
        if (lat && long) {
            let geolocation = {
                type: "point",
                coordinates: [lat, long]
            };
            yield adminschema_1.Admin.findByIdAndUpdate(superadmin._id, exports.geoLocation);
            res.json({ superadmin, status: true });
            return;
        }
        res.json({ message: "please add latitude longitud" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.geoLocation = geoLocation;
const getGeoLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let superadmin = req.admin;
        if (!superadmin) {
            res.json({ message: 'cannot find geoLocation', status: false });
            return;
        }
        res.json({ superadmin, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getGeoLocation = getGeoLocation;
const shippingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let superadmin = req.admin;
        const { shippingRate, shippingCost } = req.body;
        if (shippingCost && shippingRate) {
            const shipping = yield adminschema_1.Admin.findByIdAndUpdate(superadmin._id, {
                shippingRate,
                shippingCost
            });
            res.json({ shipping, status: true });
            return;
        }
        res.json({ message: "shipping coat and shipping rate required", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.shippingData = shippingData;
const getShippingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superadmin = req.admin;
        if (!superadmin) {
            res.json({ message: "shipping rate not found", status: false });
            return;
        }
        res.json({ superadmin, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getShippingData = getShippingData;
const banner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId, link } = req.body;
        console.log(req.body, 'banner');
        console.log(req.file, 'banner');
        if (!req.file) {
            res.json({ message: "banner image required", status: false });
            return;
        }
        let product = yield Product_1.Product.findOne({
            _id: productId,
            isVerified: { $ne: null },
            isDeleted: null
        });
        if (!product) {
            const { filename } = req.file;
            const path = `public/uploads/banner/${filename}`;
            fs_1.default.unlinkSync(path); //remove banner image if not product
            res.json({ message: "product not found", status: false });
            return;
        }
        //image compress
        //--------------
        const { filename } = req.file;
        const newBanner = yield banner_1.Banner.create({
            bannerPhoto: filename,
            product: product._id,
            link: link
        });
        res.json({ message: "banner created", newBanner, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.banner = banner;
const editeBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banner_id, productId, link } = req.body;
        let banner = yield banner_1.Banner.findById(banner_id);
        if (!banner) {
            if (req.file) {
                const { filename } = req.file;
                const path = `public/uploads/banner/${filename}`;
                fs_1.default.unlinkSync(path);
            }
            res.json({ message: "banner not found", status: false });
            return;
        }
        let product = yield Product_1.Product.findOne({
            _id: productId,
            isVerified: { $ne: null },
            isDeleted: null
        });
        if (!product) {
            if (req.file) {
                const { filename } = req.file;
                const path = `public/uploads/banner/${filename}`;
                fs_1.default.unlinkSync(path); //remove banner image if not product
            }
            res.json({ message: "product not found", status: false });
            return;
        }
        banner.product = product._id;
        if (req.file) {
            const { filename } = req.file;
            const path = `public/uploads/banner/${banner === null || banner === void 0 ? void 0 : banner.bannerPhoto}`;
            fs_1.default.unlinkSync(path);
            banner.bannerPhoto = filename;
        }
        banner.link = link;
        yield banner.save();
        res.json({ message: "banner edit", banner, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.editeBanner = editeBanner;
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banner_id } = req.body;
        let banner = yield banner_1.Banner.findById(banner_id);
        if (!banner) {
            res.json({ message: 'Banner not found.', status: false });
            return;
        }
        if (banner.isDeleted == null) {
            banner.isDeleted = Date.now();
            yield banner.save();
            res.json({ banner, status: false, message: "Banner Removed" });
            return;
        }
        banner.isDeleted = null;
        yield banner.save();
        res.json({ banner, status: true, message: "Banner Actived" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteBanner = deleteBanner;
const getBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const status = req.query.status;
        const perPage = 10;
        let query = {};
        if (status == 'active') {
            query = {
                isDeleted: null
            };
        }
        if (status == 'remove') {
            query = {
                isDeleted: { $ne: null }
            };
        }
        let banners = yield banner_1.Banner.find(query)
            .skip(perPage * page)
            .limit(perPage)
            .lean();
        const totalCount = banners.length;
        const pagination = Math.ceil(totalCount / perPage);
        res.json({ banners, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getBanners = getBanners;
const getDeletedBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        const totalCount = yield banner_1.Banner.countDocuments({ isDeleted: { $ne: null } });
        const pagination = Math.ceil(totalCount / perPage);
        let banners = yield banner_1.Banner.find({ isDeleted: { $ne: null } })
            .skip(perPage * page)
            .limit(perPage)
            .lean();
        // if (!banners.length) {
        //     return res.status(404).json({ error: 'Banners not available.' })
        // }
        res.json({ banners, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getDeletedBanners = getDeletedBanners;
const addLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        let lead = yield Lead_1.Lead.findOne({ email: email });
        if (lead) {
            res.json({ message: 'Lead has already been created.', status: false });
            return;
        }
        let newLead = new Lead_1.Lead({ email: req.body.email });
        yield newLead.save();
        res.json({ newLead, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.addLead = addLead;
const getAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const status = req.query.status;
        let query = {
            _id: { $ne: (_a = req === null || req === void 0 ? void 0 : req.admin) === null || _a === void 0 ? void 0 : _a._id }
        };
        const totalCount = yield adminschema_1.Admin.countDocuments(query);
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        const pagination = Math.ceil(totalCount / perPage);
        if (req.query.keyword)
            query = Object.assign(Object.assign({}, query), { name: { $regex: req.query.keyword, $option: "i" } });
        if (status && status == "verified") {
            query = Object.assign(Object.assign({}, query), { isVerified: { $ne: null } });
        }
        if (status && status == "blocked") {
            query = Object.assign(Object.assign({}, query), { isBlocked: { $ne: null } });
        }
        const admins = yield adminschema_1.Admin.find(query)
            .select("-password -salt -resetPasswordLink -emailVerifyLink")
            .limit(perPage)
            .skip(perPage * page);
        res.json({ admins, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getAdmins = getAdmins;
const getSingleAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { adminId } = req.params;
        const isAdmin = yield adminschema_1.Admin.findOne({ _id: adminId })
            .populate("businessInfo")
            .populate("adminBank")
            .populate("adminWareHouse");
        if (!isAdmin) {
            res.json({ message: "admin not found", status: false });
            return;
        }
        res.json({ isAdmin, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getSingleAdmin = getSingleAdmin;
const getAllDispatchers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const totalCount = yield dispatcher_1.Dispatch.countDocuments();
        const perPage = 10;
        const pagination = Math.ceil(totalCount / perPage);
        const dispatchers = yield dispatcher_1.Dispatch.find({})
            .select("-password -salt -resetPasswordLink ")
            .limit(perPage)
            .skip(perPage * page)
            .lean();
        res.json({ dispatchers, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getAllDispatchers = getAllDispatchers;
const addDispatcher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const { success, data, error } = schema_1.dispatcherValidate.safeParse(req.body);
        if (!success) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.errors[0].message });
            return;
        }
        const isDispatch = yield dispatcher_1.Dispatch.findOne({ email });
        if (!isDispatch) {
            res.json({ message: "Email is taken", status: false });
            return;
        }
        const hashPassword = bcryptjs_1.default.hashSync(req.body.password, 10);
        const newDispatch = yield dispatcher_1.Dispatch.create(Object.assign({ password: hashPassword }, req.body));
        res.json({ message: "created dispatch", status: true, newDispatch });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.addDispatcher = addDispatcher;
const editeDispatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dispatch_id } = req.body;
        const { oldPassword, newPassword } = req.body;
        let isDispatch = yield dispatcher_1.Dispatch.findById(dispatch_id);
        if (!isDispatch) {
            res.json({ message: "dispatch not found", status: false });
            return;
        }
        if (oldPassword && newPassword) {
            const dispatch = yield dispatcher_1.Dispatch.findOne({ email: isDispatch.email, password: oldPassword });
            if (!dispatch) {
                res.json({ message: "wrong password", status: false });
                return;
            }
        }
        const hashPassword = bcryptjs_1.default.hashSync(newPassword, 10);
        yield dispatcher_1.Dispatch.findByIdAndUpdate(isDispatch._id, Object.assign({ password: hashPassword }, req.body));
        res.json({ message: "dispatch edit", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.editeDispatch = editeDispatch;
const blockUnbolckDispatcher = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dispatch_id } = req.params;
        let dispatche = yield dispatcher_1.Dispatch.findById(dispatch_id)
            .select("-password -resetPasswordLink");
        if (!dispatche) {
            res.json({ message: 'Dispatcher not found.', status: false });
            return;
        }
        if (dispatche.isBlocked) {
            dispatche.isBlocked = null;
            yield dispatche.save();
            res.json({ dispatche, message: "unblock dispatche", status: true });
            return;
        }
        dispatche.isBlocked = Date.now();
        yield dispatche.save();
        res.json({ dispatche, message: "blocked dispatche", status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.blockUnbolckDispatcher = blockUnbolckDispatcher;
const flipAdminBusinessApproval = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { b_id } = req.params;
        let businessInfo = yield business_info_1.Businessinfo.findById(b_id);
        if (!businessInfo) {
            res.json({ message: "No business information available", status: false });
            return;
        }
        if (businessInfo.isVerified) {
            let admin = yield adminschema_1.Admin.findById(businessInfo === null || businessInfo === void 0 ? void 0 : businessInfo.admin);
            if (!admin) {
                res.json({ message: "admin not found", status: false });
                return;
            }
            businessInfo.isVerified = null;
            admin.isVerified = null;
            yield businessInfo.save();
            yield admin.save();
            res.json({ businessInfo, status: false, message: "business un-Approved" });
            return;
        }
        businessInfo.isVerified = Date.now();
        yield businessInfo.save();
        res.json({ businessInfo, status: true, message: "business approved" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.flipAdminBusinessApproval = flipAdminBusinessApproval;
const flipAdminBankApprovel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bank_id } = req.params;
        let bankInfo = yield adminBank_1.AdminBank.findById(bank_id);
        if (!bankInfo) {
            res.json({ message: "No bank information available", status: false });
            return;
        }
        if (bankInfo.isVerified) {
            let admin = yield adminschema_1.Admin.findById(bankInfo === null || bankInfo === void 0 ? void 0 : bankInfo.admin);
            if (!admin) {
                res.json({ message: "admin not found", status: false });
                return;
            }
            bankInfo.isVerified = null;
            admin.isVerified = null;
            yield bankInfo.save();
            yield admin.save();
            res.json({ bankInfo, status: false, message: "bank information un-Approved" });
            return;
        }
        bankInfo.isVerified = Date.now();
        yield bankInfo.save();
        res.json({ bankInfo, status: true, message: "bank information approved" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.flipAdminBankApprovel = flipAdminBankApprovel;
const flipAdminWareHouseApprovel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { w_id } = req.params;
        let wareHouseInfo = yield AdminWareHouse_1.AdminWareHouse.findById(w_id);
        if (!wareHouseInfo) {
            res.json({ message: "No wareHouseInfo information available", status: false });
            return;
        }
        if (wareHouseInfo.isVerified) {
            let admin = yield adminschema_1.Admin.findById(wareHouseInfo === null || wareHouseInfo === void 0 ? void 0 : wareHouseInfo.admin);
            if (!admin) {
                res.json({ message: "admin not found", status: false });
                return;
            }
            wareHouseInfo.isVerified = null;
            admin.isVerified = null;
            yield wareHouseInfo.save();
            yield admin.save();
            res.json({ wareHouseInfo, status: false, message: "wareHouseInfo information un-Approved" });
            return;
        }
        wareHouseInfo.isVerified = Date.now();
        yield wareHouseInfo.save();
        res.json({ wareHouseInfo, status: true, message: "wareHouseInfo information approved" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.flipAdminWareHouseApprovel = flipAdminWareHouseApprovel;
// admin account verification
const flipAdminAccountApproval = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { a_id } = req.params;
        const { email } = req.body;
        let adminAccount = yield adminschema_1.Admin.findOne({ email })
            .populate("businessInfo")
            .populate("adminBank")
            .populate("adminWareHouse")
            .select('-password -salt -resetPasswordLink -emailVerifyLink');
        if (!adminAccount) {
            res.json({ message: "Account has not been created", status: false });
            return;
        }
        if (adminAccount.emailVerifyLink) {
            res.json({ message: "admin email has not been verified.", status: false });
            return;
        }
        if (adminAccount.isBlocked) {
            res.json({ message: "admin account is blocked.", status: false });
            return;
        }
        if (!adminAccount.businessInfo.isVerified) {
            res.json({ message: "Admin business information has not been verified", status: false });
            return;
        }
        if (!adminAccount.adminBank.isVerified) {
            res.json({ message: "Admin bank information has not been verified", status: false });
            return;
        }
        if (!adminAccount.adminWareHouse.isVerified) {
            res.json({ message: "Admin warehouse information has not been verified", status: false });
            return;
        }
        if (adminAccount.isVerified) {
            adminAccount.isVerified = null;
            yield adminAccount.save();
            res.json({ adminAccount, status: false, message: "admin account un-Approved" });
            return;
        }
        adminAccount.isVerified = Date.now();
        yield adminAccount.save();
        res.json({ adminAccount, status: true, message: "admin account approved" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.flipAdminAccountApproval = flipAdminAccountApproval;
const blockUnblockAdminAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        console.log(email);
        let admin = yield adminschema_1.Admin.findOne({ email })
            .select('-password -salt -resetPasswordLink -emailVerifyLink');
        if (!admin) {
            res.json({ message: "Admin not found" });
            return;
        }
        if (admin.isBlocked) {
            admin.isBlocked = null;
            yield admin.save();
            res.json({ admin, status: true, message: "admin Account unblocked" });
            return;
        }
        let products = yield Product_1.Product.find({ soldBy: admin._id });
        admin.isBlocked = Date.now();
        admin.isVerified = null;
        yield admin.save();
        products = products.map((p) => __awaiter(void 0, void 0, void 0, function* () {
            p.isVerified = null;
            return yield p.save();
        }));
        yield Promise.all(products);
        res.json({ admin, message: 'admin account bloacked', status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.blockUnblockAdminAccount = blockUnblockAdminAccount;
const blockUnblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        let user = yield userModelsSchema_1.User.findById(user_id)
            .select('-password -salt -resetPasswordLink -emailVerifyLink');
        if (!user) {
            res.json({ message: "User not found", status: false });
            return;
        }
        if (user.isBlocked) {
            user.isBlocked = null;
            yield user.save();
            res.json({ user, message: "user account unblocked", status: true });
            return;
        }
        user.isBlocked = Date.now();
        yield user.save();
        res.json({ user, message: "user account blocked", status: false });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.blockUnblockUser = blockUnblockUser;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        let status = req.query.status;
        let query = {};
        const prepage = 10;
        const totalCount = yield userModelsSchema_1.User.countDocuments();
        const pagenation = Math.ceil(totalCount / prepage);
        if (status && status == "unblocked")
            query = {
                isBlocked: null
            };
        if (status && status == "blocked")
            query = {
                isBlocked: { $ne: null }
            };
        let users = yield userModelsSchema_1.User.find(query)
            .limit(prepage)
            .skip(prepage * page)
            .lean();
        res.json({ users, status: true, pagenation, totalCount });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getUser = getUser;
const category = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { brands, parent_id, displayName, systemName, category_id } = req.body;
        console.log(req.body);
        console.log(req.file);
        const category = yield Category_1.Category.findOne({ displayName });
        const filePath = `public/uploads/category/${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
        if (category_id) {
            let updateCategory = yield Category_1.Category.findOne({ _id: category_id });
            if (!category) {
                res.json({ message: "category not Found", status: false });
                yield (0, fileRemover_1.removeImageFile)(filePath);
                return;
            }
            if (!updateCategory) {
                yield (0, fileRemover_1.removeImageFile)(filePath);
                res.json({ message: 'category not found', status: false });
                return;
            }
            if ((_b = req.file) === null || _b === void 0 ? void 0 : _b.filename) {
                //delete the old image if it exists
                const updateFilPath = `public/uploads/category/${updateCategory === null || updateCategory === void 0 ? void 0 : updateCategory.image}`;
                updateCategory.image = (_c = req === null || req === void 0 ? void 0 : req.file) === null || _c === void 0 ? void 0 : _c.filename;
                yield (0, fileRemover_1.removeImageFile)(updateFilPath);
            }
            updateCategory.displayName = displayName,
                updateCategory.parent = parent_id,
                updateCategory.systemName = systemName,
                yield updateCategory.save();
            res.json({ updateCategory, message: "category updated", status: true });
            return;
        }
        if ((req === null || req === void 0 ? void 0 : req.file) == undefined || !req.file) {
            res.json({ message: "image required", status: false });
            return;
        }
        if (category) {
            res.json({ message: "category already exist", status: false });
            return;
        }
        const createNewCategory = yield Category_1.Category.create({
            displayName: displayName,
            parent: parent_id,
            systemName,
            image: (_d = req === null || req === void 0 ? void 0 : req.file) === null || _d === void 0 ? void 0 : _d.filename,
            brands
        });
        res.json({ message: 'created new Category', createNewCategory, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.category = category;
const getCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page, status } = req.query;
        const limit = 10;
        const skipPage = limit * Number(page) - 1;
        let query = {
            isDisabled: null
        };
        if (status == 'active') {
            query = {
                isDisabled: null
            };
        }
        if (status == 'disabled') {
            query = {
                isDisabled: { $ne: null }
            };
        }
        let categories = yield Category_1.Category.find(query)
            .limit(limit)
            .skip(skipPage)
            .sort({ createdAt: 1 });
        const totalCategory = categories.length;
        const pagination = Math.ceil((totalCategory / limit));
        res.json({ categories, status: true, totalCategory, pagination });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getCategory = getCategory;
const getSingleCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryId } = req.params;
        const isCategory = yield Category_1.Category.findOne({ _id: categoryId, isDisabled: null });
        if (!isCategory) {
            res.json({ message: 'category not found', status: false });
            return;
        }
        res.json({ isCategory, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getSingleCategory = getSingleCategory;
const flipCategoryAvailablity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.body;
        let category = yield Category_1.Category.findOne({ _id: category_id });
        if (!category) {
            res.json({ message: "category not found", status: false });
            return;
        }
        if (category.isDisabled) {
            category.isDisabled = null;
            yield category.save();
            res.json({ category, message: "category unDisabled", status: true });
            return;
        }
        category.isDisabled = Date.now();
        yield category.save();
        res.json({ category, message: "Category disabled", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.flipCategoryAvailablity = flipCategoryAvailablity;
const toggleProductFeatured = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_id } = req.body;
        let product = yield Product_1.Product.findOne({ _id: product_id, isVerified: { $ne: null }, isDeleted: null, isRejected: null });
        if (!product) {
            res.json({ message: "Product not found.", status: false });
            return;
        }
        product.isFeatured = product.isFeatured ? null : Date.now();
        product = yield product.save();
        res.json({ product });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.toggleProductFeatured = toggleProductFeatured;
const approveProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_id } = req.params;
        const product = yield Product_1.Product.findOne({ _id: product_id })
            .populate({
            path: "remark",
            model: "Remark",
            match: {
                isDeleted: null
            }
        });
        if (!product) {
            res.json({ message: "product not found", status: false });
            return;
        }
        let categories = yield Category_1.Category.find({ _id: product.category }); //may b array of category as well
        if (!categories.length) {
            res.json({ message: "Categories not found of this product.", status: false });
            return;
        }
        // if product has new brand 
        const addBrandToCategory = (brand, categorie) => __awaiter(void 0, void 0, void 0, function* () {
            categorie.forEach((cat) => {
                if (!cat.brands.includes(brand)) {
                    cat.brands.push(brand);
                }
            });
        });
        //add tags to suggestKeywords 
        const addKeywords = (tags) => __awaiter(void 0, void 0, void 0, function* () {
            let keywords = yield suggestKeyword_1.SuggestKeyword.find().select('-_id keyword');
            keywords = keywords.map(key => key.keyword);
            let Keywords = tags.map((tag) => __awaiter(void 0, void 0, void 0, function* () {
                if (!keywords.includes(tag)) {
                    let newKeyWord = new suggestKeyword_1.SuggestKeyword({ keyword: tag });
                    yield newKeyWord.save();
                }
                return tag;
            }));
            yield Promise.all(Keywords);
        });
        //add districts to Districts
        const addDistricts = (districts) => __awaiter(void 0, void 0, void 0, function* () {
            let _districts = yield districts_1.District.find().select('-_id name');
            _districts = _districts.map(key => key.name);
            let __districts = districts.map((district) => __awaiter(void 0, void 0, void 0, function* () {
                if (!_districts.includes(district)) {
                    let newDistrict = new districts_1.District({ name: district });
                    yield newDistrict.save();
                }
                return district;
            }));
            yield Promise.all(__districts);
        });
        if (!product.remark.length) {
            product.isVerified = Date.now();
            product.isRejected = null;
            addBrandToCategory(product.brand, categories);
            addKeywords(product.tags);
            addDistricts(product.availableDistricts);
            yield product.save();
            res.json({ product, status: true, message: "product approved" });
            return;
        }
        const remark = yield Remark_1.Remark.findById(product.remark[0]);
        const updateRemark = remark.toObject();
        updateRemark.isDeleted = Date.now();
        const updateProduct = product.toObject();
        updateProduct.isVerified = Date.now();
        updateProduct.isRejected = null;
        addBrandToCategory(updateProduct.brand, categories);
        addKeywords(product.tags);
        addDistricts(product.availableDistricts);
        yield updateProduct.save();
        res.json({ updateProduct, status: true, message: "product approved" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.approveProduct = approveProduct;
const disApproveProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_id } = req.params;
        const { comment } = req.body;
        const product = yield Product_1.Product.findOne({ _id: product_id });
        if (!product) {
            res.json({ message: "Product not found", status: false });
            return;
        }
        const newRemark = new Remark_1.Remark({
            comment
        });
        product.isVerified = null,
            product.isRejected = Date.now();
        product.isDeleted = null;
        product.isFeatured = null;
        product.remark.push(newRemark._id);
        yield product.save();
        res.json({ product, message: "unVerified product", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.disApproveProduct = disApproveProduct;
const getProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perpage = 10;
        const { createdAt, updatedAt, price, status, keyword, outofstock } = req.query;
        let query = {};
        let sortFactor = {};
        if (createdAt && (createdAt === 'asc' || createdAt === 'desc'))
            sortFactor = { createdAt };
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc'))
            sortFactor = { updatedAt };
        if (price && (price === '-1' || price === '1'))
            sortFactor = { price: price == "1" ? 1 : -1 };
        if (keyword)
            query = Object.assign(Object.assign({}, query), { name: { $regex: keyword, $options: "i" } });
        if (status && status === 'verified')
            query = Object.assign(Object.assign({}, query), { isVerified: { $ne: null } });
        if (status && status === 'rejected')
            query = Object.assign(Object.assign({}, query), { isRejected: { $ne: null } });
        if (status && status === 'featured')
            query = Object.assign(Object.assign({}, query), { isFeatured: { $ne: null } });
        if (status && status === 'unverified')
            query = Object.assign(Object.assign({}, query), { isVerified: null });
        if (status && status === 'deleted')
            query = Object.assign(Object.assign({}, query), { isDeleted: { $ne: null } });
        if (status && status === 'notdeleted')
            query = Object.assign(Object.assign({}, query), { isDeleted: null });
        if (outofstock && outofstock === 'yes')
            query = Object.assign(Object.assign({}, query), { quantity: 0 });
        let products = yield Product_1.Product.find(query)
            .populate("category", "displayName slug")
            .populate("brand", "brandName slug")
            .populate("soldBy", "name _id shopName")
            .populate("images", "-createdAt -updatedAt -__v")
            .skip(perpage * page)
            .limit(perpage)
            .lean()
            .sort(sortFactor);
        let totalCount = products.length;
        const pagination = Math.ceil(totalCount / perpage);
        res.json({ products, pagination, totalCount, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getProduct = getProduct;
const productBrandItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { brandName, brand_id, systemName } = req.body;
        if (brand_id) {
            let updateBrand = yield productBrand_1.ProductBrand.findById(brand_id);
            if (!updateBrand) {
                res.json({ message: "Product brand not found.", status: false });
                return;
            }
            // then update
            updateBrand.brandName = brandName;
            yield updateBrand.save();
            res.json({ updateBrand, message: "update product brand", status: true });
            return;
        }
        let newBrand = yield productBrand_1.ProductBrand.findOne({ brandName });
        if (newBrand) {
            res.json({ message: "Product brand already exist", status: false });
            return;
        }
        newBrand = new productBrand_1.ProductBrand({ systemName, brandName });
        yield newBrand.save();
        res.json({ newBrand, message: "new ProductBrand created", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.productBrandItems = productBrandItems;
const getProductBrands = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let productbrands = yield productBrand_1.ProductBrand.find();
        res.json({ productbrands, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getProductBrands = getProductBrands;
