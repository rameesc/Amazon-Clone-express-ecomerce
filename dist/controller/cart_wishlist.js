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
Object.defineProperty(exports, "__esModule", { value: true });
exports.editWishlist = exports.deleteWishlist = exports.getWishlists = exports.addwishlist = exports.editCart = exports.deleteCart = exports.getCarts = exports.buyNowItem = exports.addCart = void 0;
const Cart_1 = require("../models/Cart");
const wishlist_1 = require("../models/wishlist");
const addCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const product = req.product;
        const { quantity, productAttributes } = req.body;
        if (quantity < 1) {
            res.json({ message: "Quantity is required", status: false });
            return;
        }
        let cart = yield Cart_1.Cart.findOne({
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id,
            product: product._id
        });
        if (cart && cart.isDeleted == null) {
            res.json({ message: "cart already exist", status: false });
            return;
        }
        if (cart && cart.isDeleted) {
            cart.isDeleted = null;
            cart.quantity = quantity;
            cart.productAttributes = productAttributes;
            yield cart.save();
            res.json({ cart, message: "add to cart", status: true });
            return;
        }
        let newCart = {
            user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id,
            product: product._id,
            quantity: quantity,
            productAttributes: productAttributes
        };
        yield Cart_1.Cart.create(newCart);
        res.json({ newCart, message: "add to cart", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.addCart = addCart;
const buyNowItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const product = req.product;
        const { quantity, productAttributes } = req.body;
        if (quantity < 1) {
            res.json({ message: "Quantity is required", status: false });
            return;
        }
        let cart = yield Cart_1.Cart.findOne({
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id,
            product: product._id
        });
        if (cart && cart.isDeleted == null) {
            res.json({ message: "cart already exist", status: true });
            return;
        }
        if (cart && cart.isDeleted) {
            cart.isDeleted = null;
            cart.quantity = quantity;
            cart.productAttributes = productAttributes;
            yield cart.save();
            res.json({ cart, message: "add to cart", status: true });
            return;
        }
        let newCart = {
            user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id,
            product: product._id,
            quantity: quantity,
            productAttributes: productAttributes
        };
        yield Cart_1.Cart.create(newCart);
        res.json({ newCart, message: "add to cart", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.buyNowItem = buyNowItem;
const searchCarts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (keyword = '', id, populateImages, populateSoldBy, prepage, page) {
    let carts = yield Cart_1.Cart.find({ user: id, isDeleted: null })
        .limit(prepage)
        .skip(prepage * page)
        .populate(populateImages)
        .populate({
        path: 'product',
        match: {
            name: { $regex: keyword, $options: "i" }
        },
        select: 'name slug images soldBy discountRate price quantity',
        populate: populateSoldBy
    })
        .lean();
    carts = carts.filter(c => c.product !== null);
    let totalCount = carts.length;
    // carts = _.drop(carts, perPage * page - perPage)
    // carts = _.take(carts, perPage)
    return ({ carts, totalCount });
});
const getCarts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const page = Number(req.query.page) - 1;
        const perpage = 10;
        const keyword = req.query.keyword;
        const populateImages = {
            path: 'product',
            populate: {
                path: 'images',
                model: "ProductImages"
            }
        };
        const populateSoldBy = {
            path: 'soldBy',
            model: "Admin",
            select: 'name shopName address'
        };
        let searchedCarts;
        let manualCarts;
        const id = ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id) || '';
        if (keyword)
            searchedCarts = yield searchCarts(keyword, id, populateImages, populateSoldBy, perpage, page);
        if (!keyword) {
            manualCarts = yield Cart_1.Cart.find({ user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id, isDeleted: null })
                .limit(perpage)
                .skip(perpage * page)
                .populate(populateImages)
                .populate({
                path: 'product',
                select: 'name slug images soldBy discountRate price quantity',
                populate: populateSoldBy
            })
                .lean();
        }
        const totalCount = (manualCarts && manualCarts.length) || (searchedCarts && searchedCarts.totalCount);
        let carts = manualCarts || (searchedCarts === null || searchedCarts === void 0 ? void 0 : searchedCarts.carts);
        let totalAmount = 0;
        let realRate = 0;
        carts === null || carts === void 0 ? void 0 : carts.forEach(c => {
            console.log(c);
            realRate += c.product.price - c.product.price * (c.product.discountRate / 100);
            totalAmount += parseFloat(c.product.price);
        });
        const pagination = Math.ceil(Number(totalCount) / perpage);
        res.json({ carts, totalCount, totalAmount, realRate, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getCarts = getCarts;
const deleteCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let cart = yield Cart_1.Cart.findOne({ _id: req.params.cart_id, user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id });
        if (!cart) {
            res.json({ message: 'Cart not found.', status: true });
            return;
        }
        cart.isDeleted = Date.now();
        yield cart.save();
        res.json({ cart, message: "cart removed", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteCart = deleteCart;
const editCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let cart = yield Cart_1.Cart.findOne({ _id: req.params.cart_id, user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, isDeleted: null });
        if (!cart) {
            res.json({ message: 'Cart not found.', status: false });
            return;
        }
        if (req.query.quantity == 'add') {
            if (cart.quantity >= 3) {
                res.json({ message: "only add maximam 3 quantity", status: true });
                return;
            }
            cart.quantity += 1;
            yield cart.save();
        }
        if (req.query.quantity == 'less') {
            if (cart.quantity == 1) {
                res.json({ message: "minimam quantity 1", status: true });
                return;
            }
            cart.quantity -= 1;
            yield cart.save();
        }
        res.json({ cart, status: true, message: "successfullt added" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.editCart = editCart;
const addwishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const product = req.product;
        const { quantity } = req.body;
        if (quantity < 1) {
            res.json({ message: 'Quantity is required', status: false });
            return;
        }
        let wishlist = yield wishlist_1.WishList.findOne({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, product: product._id });
        if (wishlist && wishlist.isDeleted === null) {
            res.json({ message: 'Wishlist already exist.', status: false });
            return;
        }
        if (wishlist && wishlist.isDeleted) {
            wishlist.isDeleted = null;
            wishlist.quantity = quantity;
            yield wishlist.save();
            res.json({ status: true, message: "Add TO wishlist" });
            return;
        }
        let newWishlist = {
            user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id,
            product: product._id,
            quantity: quantity
        };
        yield wishlist_1.WishList.create(newWishlist);
        res.json({ status: true, message: "add TO wishlist" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.addwishlist = addwishlist;
const searchWishlists = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (keyword = '', id, populateImages, populateSoldBy, page, prePage) {
    let wishlists = yield wishlist_1.WishList.find({ user: id, isDeleted: null })
        .limit(prePage)
        .skip(prePage * page)
        .populate(populateImages)
        .populate({
        path: 'product',
        match: {
            name: { $regex: keyword, $options: "i" }
        },
        select: 'name slug images soldBy discountRate price quantity',
        populate: populateSoldBy
    })
        .lean();
    wishlists = wishlists.filter(c => c.product !== null);
    let totalCount = wishlists.length;
    // wishlists = _.drop(wishlists, perPage * page - perPage)
    // wishlists = _.take(wishlists, perPage)
    return ({ wishlists, totalCount });
});
const getWishlists = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const keyword = req.query.keyword;
        const prePage = 10;
        const page = Number(req.query.page) - 1;
        const populateImages = {
            path: 'product',
            populate: {
                path: 'images',
                model: 'ProductImages'
            }
        };
        const populateSoldBy = {
            path: 'soldBy',
            model: 'Admin',
            select: 'name shopname address'
        };
        let searchedWishlists;
        let manualWishlists;
        const id = ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id) || '';
        if (keyword)
            searchedWishlists = yield searchWishlists(keyword, id, populateImages, populateSoldBy, page, prePage);
        if (!keyword) {
            manualWishlists = yield wishlist_1.WishList.find({ user: id, isDeleted: null })
                .limit(prePage)
                .skip(prePage * page)
                .populate(populateImages)
                .populate({
                path: 'product',
                select: 'name slug images soldBy discountRate price quantity',
                populate: populateSoldBy
            })
                .lean();
        }
        const totalCount = (manualWishlists && manualWishlists.length) || (searchedWishlists && searchedWishlists.totalCount);
        let wishlists = manualWishlists || (searchedWishlists === null || searchedWishlists === void 0 ? void 0 : searchedWishlists.wishlists);
        //  let totalAmount = 0
        //  wishlists?.forEach(c => {
        //     totalAmount += parseFloat(c.product.price)
        //  })
        const pagination = Math.ceil(Number(totalCount) / prePage);
        res.json({ wishlists, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getWishlists = getWishlists;
const deleteWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id;
        let wishlist = yield wishlist_1.WishList.findOne({ _id: req.params.wishlist_id, user: id });
        if (!wishlist) {
            res.json({ message: 'Wishlist not found.', status: false });
            return;
        }
        wishlist.isDeleted = Date.now();
        yield wishlist.save();
        res.json({ message: 'Item Removed from wishList', status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.deleteWishlist = deleteWishlist;
const editWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let wishlist = yield wishlist_1.WishList.findOne({ _id: req.params.wishlist_id, user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, isDeleted: null });
        if (!wishlist) {
            res.json({ message: 'Wishlist not found.', status: false });
            return;
        }
        wishlist.quantity = Number(req.query.quantity);
        yield wishlist.save();
        res.json({ wishlist, status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.editWishlist = editWishlist;
