
import express from "express";

import { 
    createProduct, 
    deleteImage, 
    deleteImageById,
     deleteProduct, 
     forYouProducts, 
     generateFilter, 
     getProduct, 
     getProducts, 
     getProductsByCategory, 
     getSingleProduct, 
     isFeatureProduct, 
     minedProduct, 
     product, 
     productImages, 
     searchProducts, 
     suggestKeywords, 
     updateProduct } from "../controller/product";
     
import { auth } from "../controller/user_auth";
import { checkAdminSignin, isAdmin } from "../controller/admin_auth";
import { uploadProductsImages } from "../middleware/helpers/multer";


export const productRouter = express.Router()


//admin or superadmin's

productRouter.get('/products',auth,product,getProduct)

productRouter.post('/images/:productId',checkAdminSignin,uploadProductsImages,productImages)
productRouter.delete('/images',checkAdminSignin,deleteImageById)
productRouter.delete('/images',checkAdminSignin,deleteImage)

//produt
productRouter.post('/createProduct',checkAdminSignin,createProduct)
productRouter.put('/updateProduct',checkAdminSignin,product,updateProduct)
productRouter.patch('/deleteProduct/:productId',checkAdminSignin,deleteProduct)
productRouter.get('/products-admin',checkAdminSignin,getProducts)
productRouter.get('/products-feature',isFeatureProduct)

productRouter.get('/get-single-one/:productId',getSingleProduct)

 
//user

productRouter.get('/for-you',auth,forYouProducts)

//public
productRouter.get('/mined-product',minedProduct)
productRouter.get('/by-category',auth,getProductsByCategory)
productRouter.get('/generate-filter',generateFilter)
productRouter.get('/search',searchProducts)
productRouter.get('/suggest-keyword',suggestKeywords)

