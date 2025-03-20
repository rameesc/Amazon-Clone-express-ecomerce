
import express from "express";
import { auth } from "../controller/user_auth";
import { addCart, addwishlist, buyNowItem, deleteCart, deleteWishlist, editCart, editWishlist, getCarts, getWishlists } from "../controller/cart_wishlist";
import { product } from "../controller/product";

export const cartRouter=express.Router();


//cart-s
cartRouter.post('/addtocart',auth,product,addCart)
cartRouter.patch('/delete-cart/:cart_id',auth,deleteCart)

cartRouter.patch('/edite-cart/:cart_id',auth,editCart)
cartRouter.get("/carts",auth,getCarts)

//bynow
cartRouter.post('/buynow',auth,product,buyNowItem)
//wishlist-s

cartRouter.post('/add-wishlist',auth,product,addwishlist)
cartRouter.get('/user-wishlist',auth,getWishlists)
cartRouter.patch('/delete-wishlist/:wishlist_id',auth,deleteWishlist)
cartRouter.patch('/edit-wishlist/:wishlist_id',auth,editWishlist)





