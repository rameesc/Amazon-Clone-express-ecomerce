"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCategoryImage = exports.uploadProductsImages = exports.uploadBannerPhoto = exports.uploadAdminDoc = exports.uploadAdminphoto = exports.uploadUserPhoto = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
// Helper function to ensure directory exists
const ensureDirectoryExists = (directoryPath) => {
    if (!fs_1.default.existsSync(directoryPath)) {
        fs_1.default.mkdirSync(directoryPath, { recursive: true });
    }
};
// Base upload path (using absolute path for reliability)
const baseUploadPath = path_1.default.join(process.cwd(), 'public', 'uploads');
//user
const storageByUser = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, 'public/uploads/user');
    }),
    filename: ((req, file, cb) => {
        var _a;
        cb(null, file.fieldname + '-' + ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id) + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
//admin s
const storage = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, 'public/uploads/admin');
    }),
    filename: ((req, file, cb) => {
        cb(null, file.fieldname + '-' + req.admin._id + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
//superadmin s
const storageBySuperAdmin = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, './public/uploads');
    }),
    filename: ((req, file, cb) => {
        var _a, _b;
        cb(null, file.fieldname + '-' + ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a.role) + '-' + ((_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id) + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
//banner
const storageBanner = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, './public/uploads/banner');
    }),
    filename: ((req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
//product image
const productImagesUpload = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        cb(null, './public/uploads/product');
    }),
    filename: ((req, file, cb) => {
        cb(null, file.fieldname + '-' + req.admin._id + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
//category image
const categoryImagesUpload = multer_1.default.diskStorage({
    destination: ((req, file, cb) => {
        const uploadPath = path_1.default.join(baseUploadPath, 'category');
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    }),
    filename: ((req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + path_1.default.extname(file.originalname));
    })
});
const limits = { fileSize: 1480 * 3230 };
exports.uploadUserPhoto = (0, multer_1.default)({ storage: storageByUser, limits: limits }).single("photo");
exports.uploadAdminphoto = (0, multer_1.default)({ storage: storage, limits: limits }).single("admin");
exports.uploadAdminDoc = (0, multer_1.default)({ storage: storage, limits: limits }).single("doc");
exports.uploadBannerPhoto = (0, multer_1.default)({ storage: storageBanner, limits: limits }).single("banner");
exports.uploadProductsImages = (0, multer_1.default)({ storage: productImagesUpload }).array("productImages", 4);
exports.uploadCategoryImage = (0, multer_1.default)({ storage: categoryImagesUpload, limits: limits }).single("category");
