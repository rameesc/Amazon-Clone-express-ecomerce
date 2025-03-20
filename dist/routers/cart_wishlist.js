"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_auth_1 = require("../controller/user_auth");
const cart_wishlist_1 = require("../controller/cart_wishlist");
const product_1 = require("../controller/product");
exports.cartRouter = express_1.default.Router();
//cart-s
exports.cartRouter.post('/addtocart', user_auth_1.auth, product_1.product, cart_wishlist_1.addCart);
exports.cartRouter.patch('/delete-cart/:cart_id', user_auth_1.auth, cart_wishlist_1.deleteCart);
exports.cartRouter.patch('/edite-cart/:cart_id', user_auth_1.auth, cart_wishlist_1.editCart);
exports.cartRouter.get("/carts", user_auth_1.auth, cart_wishlist_1.getCarts);
//bynow
exports.cartRouter.post('/buynow', user_auth_1.auth, product_1.product, cart_wishlist_1.buyNowItem);
//wishlist-s
exports.cartRouter.post('/add-wishlist', user_auth_1.auth, product_1.product, cart_wishlist_1.addwishlist);
exports.cartRouter.get('/user-wishlist', user_auth_1.auth, cart_wishlist_1.getWishlists);
exports.cartRouter.patch('/delete-wishlist/:wishlist_id', user_auth_1.auth, cart_wishlist_1.deleteWishlist);
exports.cartRouter.patch('/edit-wishlist/:wishlist_id', user_auth_1.auth, cart_wishlist_1.editWishlist);
