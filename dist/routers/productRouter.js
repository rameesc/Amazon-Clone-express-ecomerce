"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const express_1 = __importDefault(require("express"));
const product_1 = require("../controller/product");
const user_auth_1 = require("../controller/user_auth");
const admin_auth_1 = require("../controller/admin_auth");
const multer_1 = require("../middleware/helpers/multer");
exports.productRouter = express_1.default.Router();
//admin or superadmin's
exports.productRouter.get('/products', user_auth_1.auth, product_1.product, product_1.getProduct);
exports.productRouter.post('/images/:productId', admin_auth_1.checkAdminSignin, multer_1.uploadProductsImages, product_1.productImages);
exports.productRouter.delete('/images', admin_auth_1.checkAdminSignin, product_1.deleteImageById);
exports.productRouter.delete('/images', admin_auth_1.checkAdminSignin, product_1.deleteImage);
//produt
exports.productRouter.post('/createProduct', admin_auth_1.checkAdminSignin, product_1.createProduct);
exports.productRouter.put('/updateProduct', admin_auth_1.checkAdminSignin, product_1.product, product_1.updateProduct);
exports.productRouter.patch('/deleteProduct/:productId', admin_auth_1.checkAdminSignin, product_1.deleteProduct);
exports.productRouter.get('/products-admin', admin_auth_1.checkAdminSignin, product_1.getProducts);
exports.productRouter.get('/products-feature', product_1.isFeatureProduct);
exports.productRouter.get('/get-single-one/:productId', product_1.getSingleProduct);
//user
exports.productRouter.get('/for-you', user_auth_1.auth, product_1.forYouProducts);
//public
exports.productRouter.get('/mined-product', product_1.minedProduct);
exports.productRouter.get('/by-category', user_auth_1.auth, product_1.getProductsByCategory);
exports.productRouter.get('/generate-filter', product_1.generateFilter);
exports.productRouter.get('/search', product_1.searchProducts);
exports.productRouter.get('/suggest-keyword', product_1.suggestKeywords);
