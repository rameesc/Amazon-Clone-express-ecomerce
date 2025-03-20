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
exports.averageRating = exports.getMyReviews = exports.getReviews = exports.editeReview = exports.postReview = void 0;
const Orderschema_1 = require("../models/Orderschema");
const Review_1 = require("../models/Review");
const getRatingInfo_1 = require("../middleware/user_action/getRatingInfo");
const Product_1 = require("../models/Product");
const postReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let product = req.product;
        if (!product.isVerified && product.isDeleted) {
            res.json({ message: 'Product not found', status: false });
            return;
        }
        if (!req.body.star) {
            res.json({ message: 'Rating is required.', status: false });
            return;
        }
        if (req.body.star && (req.body.star > 5 || req.body.star < 1)) {
            res.json({ message: "Rating should be in range of 0 and 5", status: false });
            return;
        }
        //ckeck if user has bought this product or not
        const orders = yield Orderschema_1.Order.findOne({
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id,
            'status.currentStatus': { $in: ['complete', 'return'] },
            product: product._id
        });
        if (!orders) {
            res.json({ message: "You have not bought this product.", status: false });
            return;
        }
        //check if user has already given star or comment
        const review = yield Review_1.Review.findOne({
            user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id,
            product: product._id
        });
        if (review && review.comment && req.body.comment) {
            res.json({ message: "You have already commented on this product.", status: false });
            return;
        }
        if (review && review.star && req.body.star) {
            res.json({ status: false, message: "You have already rated on this product." });
            return;
        }
        let newReview = {
            user: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c._id,
            product: product._id,
            comment: req.body.comment,
            star: req.body.star
        };
        let newRevie = new Review_1.Review(newReview);
        let stars = yield (0, getRatingInfo_1.getRatingInfo)(product, newReview.star);
        let updateProduct = yield Product_1.Product.findById(product._id);
        updateProduct.totalRatingUsers = stars.totalRatingUser;
        updateProduct.averageRating = stars.averageStar;
        yield updateProduct.save();
        yield newRevie.save();
        res.json({ newReview, status: true, message: 'Thanks for you feedback' });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.postReview = postReview;
const editeReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let product = req.product;
        if (!product.isVerified && product.isDeleted) {
            res.json({ message: 'Product not found', status: false });
            return;
        }
        if (!req.body.star) {
            res.json({ message: 'Rating is required.', status: false });
            return;
        }
        if (req.body.star && (req.body.star > 5 || req.body.star < 1)) {
            res.json({ message: "Rating should be in range of 1 and 5", status: false });
            return;
        }
        //ckeck if user has bought this product or not
        const orders = yield Orderschema_1.Order.findOne({
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id,
            'status.currentStatus': { $in: ['complete', 'return'] },
            product: product._id
        });
        if (!orders) {
            res.json({ status: false, message: "You have not bought this product." });
            return;
        }
        //check if user has already given star and comment
        let review = yield Review_1.Review.findById(req.params.review_id);
        if (!review) {
            res.json({ status: false, message: 'Review not found' });
            return;
        }
        review.comment = req.body.comment;
        review.star = req.body.star;
        let stars = yield (0, getRatingInfo_1.getRatingInfo)(product, +review.star);
        let updateProduct = yield Product_1.Product.findById(product._id);
        updateProduct.totalRatingUsers = stars.totalRatingUser;
        updateProduct.averageRating = stars.averageStar;
        yield updateProduct.save();
        yield review.save();
        res.json({ review, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.editeReview = editeReview;
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        // const product = req.product
        const { productId } = req.params;
        const product = yield Product_1.Product.findOne({ _id: productId });
        if (!product.isVerified && product.isDeleted) {
            res.json({ message: 'Product not found', status: false });
            return;
        }
        const reviews = yield Review_1.Review.find({ product: product === null || product === void 0 ? void 0 : product._id })
            .populate('user', 'name  photo')
            .skip(perPage * page)
            .limit(perPage)
            .lean();
        const totalCount = yield Review_1.Review.countDocuments({ product: product._id });
        const pagination = Math.ceil(Number(totalCount / perPage));
        console.log(reviews, totalCount, pagination, 20);
        res.json({ reviews, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getReviews = getReviews;
const getMyReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        const myReviews = yield Review_1.Review.find({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id })
            .populate({
            path: "product",
            select: "images",
            populate: {
                path: "images",
                model: "ProductImages"
            }
        })
            .populate({
            path: "product",
            select: "soldBy name slug images",
            populate: {
                path: "soldBy",
                model: "Admin",
                select: 'shopName'
            }
        })
            .skip(perPage * page)
            .limit(perPage)
            .lean();
        // if (!myReviews.length) {
        //     return res.status(404).json({ error: "No reviews found" });
        // }
        const totalCount = myReviews.length;
        const pagination = Math.ceil(Number(totalCount / perPage));
        res.json({ myReviews, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getMyReviews = getMyReviews;
const averageRating = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        const isProduct = yield Product_1.Product.findOne({ _id: productId });
        if (!isProduct) {
            res.json({ message: "product not found", status: true });
            return;
        }
        let stars = yield (0, getRatingInfo_1.getRatingInfo)(isProduct, 0);
        res.json({ stars, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.averageRating = averageRating;
