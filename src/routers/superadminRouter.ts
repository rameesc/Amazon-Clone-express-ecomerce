
import express from "express";
import { checkAdminSignin, isSuperadmin } from "../controller/admin_auth";
import { 
  addDispatcher, 
  addLead, 
  approveProduct, 
  banner, 
  blockUnblockAdminAccount, 
  blockUnblockUser, 
  blockUnbolckDispatcher, 
  category, 
  deleteBanner, 
  disApproveProduct, 
  editeBanner, 
  editeDispatch, 
  flipAdminAccountApproval, 
  flipAdminBankApprovel, 
  flipAdminBusinessApproval, 
  flipAdminWareHouseApprovel, 
  flipCategoryAvailablity, 
  geoLocation, 
  getAdmins, 
  getAllDispatchers, 
  getBanners, 
  getCategory, 
  getGeoLocation, 
  getProduct, 
  getProductBrands, 
  getShippingData, 
  getSingleAdmin, 
  getSingleCategory, 
  getUser, 
  productBrandItems, 
  shippingData, 
  toggleProductFeatured } from "../controller/superadmin";
import { uploadBannerPhoto, uploadCategoryImage } from "../middleware/helpers/multer";

export const superadminRouter=express.Router();


//superadmin,s ..
superadminRouter
  .route('/geo-location')
  .put(checkAdminSignin,isSuperadmin, geoLocation)
  .get(checkAdminSignin,isSuperadmin,getGeoLocation)


  //banner

superadminRouter.route('/banner')
.post(checkAdminSignin,isSuperadmin,uploadBannerPhoto,banner)
.put(checkAdminSignin,isSuperadmin,uploadBannerPhoto,editeBanner)//edite
.delete(checkAdminSignin,isSuperadmin,deleteBanner)
.get(getBanners)

superadminRouter.get('/deleted-banner',checkAdminSignin,isSuperadmin,getBanners)


 //shipping rate & coast
  superadminRouter
    .route('/shipping-rate')
    .post(checkAdminSignin,isSuperadmin,shippingData)
    .get(checkAdminSignin,isSuperadmin,getShippingData)




//add lead
superadminRouter.post('/add-lead',checkAdminSignin,isSuperadmin,addLead)


//admin s
superadminRouter.get('/admins',checkAdminSignin,isSuperadmin,getAdmins);
superadminRouter.patch('/flip-admin-business-approval/:b_id', checkAdminSignin,isSuperadmin ,flipAdminBusinessApproval)
superadminRouter.patch('/flip-admin-bank-approval/:bank_id', checkAdminSignin,isSuperadmin ,flipAdminBankApprovel)
superadminRouter.patch('/flip-admin-warehouse-approval/:w_id', checkAdminSignin,isSuperadmin ,flipAdminWareHouseApprovel)
superadminRouter.patch('/flip-admin-account-approval', checkAdminSignin,isSuperadmin ,flipAdminAccountApproval)
superadminRouter.patch('/blcok-unblock-admin', checkAdminSignin,isSuperadmin ,blockUnblockAdminAccount)

superadminRouter.get('/single-admin/:adminId',getSingleAdmin)



//dispatcher's
superadminRouter.get('/dispatchers',checkAdminSignin,isSuperadmin,getAllDispatchers)
superadminRouter.post('/add-dispatchers',checkAdminSignin,isSuperadmin,addDispatcher)
superadminRouter.put('/update-dispatchers',checkAdminSignin,isSuperadmin,editeDispatch)
superadminRouter.patch('/block-unblock-dispatch/:dispatch_id',checkAdminSignin,isSuperadmin,blockUnbolckDispatcher)

//user's

superadminRouter.patch('/block-unblock-user/:user_id',checkAdminSignin,isSuperadmin,blockUnblockUser)
superadminRouter.get('/users',checkAdminSignin,isSuperadmin,getUser)

//category's
//checkAdminSignin,isSuperadmin,
superadminRouter.put('/produtc-category',uploadCategoryImage,category) //create & update
superadminRouter.get('/produtc-category',getCategory) 
superadminRouter.get('/produtc-category/:categoryId',getSingleCategory) 
superadminRouter.patch('/flip-category-availablity',checkAdminSignin,isSuperadmin, flipCategoryAvailablity) 


//product 's
superadminRouter.patch('/featured-product',checkAdminSignin,isSuperadmin,toggleProductFeatured)
superadminRouter.patch('/approve-product/:product_id',checkAdminSignin,isSuperadmin,approveProduct)
superadminRouter.put('/disapprove-product/:product_id',checkAdminSignin,isSuperadmin,disApproveProduct)
superadminRouter.get('/products',checkAdminSignin,isSuperadmin,getProduct)

//product_brand's
superadminRouter.put('/product-brand',checkAdminSignin,isSuperadmin,productBrandItems)
superadminRouter.get('/product-brands',checkAdminSignin,getProductBrands)
