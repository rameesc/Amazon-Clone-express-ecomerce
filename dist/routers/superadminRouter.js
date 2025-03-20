"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superadminRouter = void 0;
const express_1 = __importDefault(require("express"));
const admin_auth_1 = require("../controller/admin_auth");
const superadmin_1 = require("../controller/superadmin");
const multer_1 = require("../middleware/helpers/multer");
exports.superadminRouter = express_1.default.Router();
//superadmin,s ..
exports.superadminRouter
    .route('/geo-location')
    .put(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.geoLocation)
    .get(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getGeoLocation);
//banner
exports.superadminRouter.route('/banner')
    .post(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, multer_1.uploadBannerPhoto, superadmin_1.banner)
    .put(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, multer_1.uploadBannerPhoto, superadmin_1.editeBanner) //edite
    .delete(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.deleteBanner)
    .get(superadmin_1.getBanners);
exports.superadminRouter.get('/deleted-banner', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getBanners);
//shipping rate & coast
exports.superadminRouter
    .route('/shipping-rate')
    .post(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.shippingData)
    .get(admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getShippingData);
//add lead
exports.superadminRouter.post('/add-lead', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.addLead);
//admin s
exports.superadminRouter.get('/admins', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getAdmins);
exports.superadminRouter.patch('/flip-admin-business-approval/:b_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.flipAdminBusinessApproval);
exports.superadminRouter.patch('/flip-admin-bank-approval/:bank_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.flipAdminBankApprovel);
exports.superadminRouter.patch('/flip-admin-warehouse-approval/:w_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.flipAdminWareHouseApprovel);
exports.superadminRouter.patch('/flip-admin-account-approval', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.flipAdminAccountApproval);
exports.superadminRouter.patch('/blcok-unblock-admin', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.blockUnblockAdminAccount);
exports.superadminRouter.get('/single-admin/:adminId', superadmin_1.getSingleAdmin);
//dispatcher's
exports.superadminRouter.get('/dispatchers', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getAllDispatchers);
exports.superadminRouter.post('/add-dispatchers', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.addDispatcher);
exports.superadminRouter.put('/update-dispatchers', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.editeDispatch);
exports.superadminRouter.patch('/block-unblock-dispatch/:dispatch_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.blockUnbolckDispatcher);
//user's
exports.superadminRouter.patch('/block-unblock-user/:user_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.blockUnblockUser);
exports.superadminRouter.get('/users', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getUser);
//category's
//checkAdminSignin,isSuperadmin,
exports.superadminRouter.put('/produtc-category', multer_1.uploadCategoryImage, superadmin_1.category); //create & update
exports.superadminRouter.get('/produtc-category', superadmin_1.getCategory);
exports.superadminRouter.get('/produtc-category/:categoryId', superadmin_1.getSingleCategory);
exports.superadminRouter.patch('/flip-category-availablity', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.flipCategoryAvailablity);
//product 's
exports.superadminRouter.patch('/featured-product', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.toggleProductFeatured);
exports.superadminRouter.patch('/approve-product/:product_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.approveProduct);
exports.superadminRouter.put('/disapprove-product/:product_id', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.disApproveProduct);
exports.superadminRouter.get('/products', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.getProduct);
//product_brand's
exports.superadminRouter.put('/product-brand', admin_auth_1.checkAdminSignin, admin_auth_1.isSuperadmin, superadmin_1.productBrandItems);
exports.superadminRouter.get('/product-brands', admin_auth_1.checkAdminSignin, superadmin_1.getProductBrands);
