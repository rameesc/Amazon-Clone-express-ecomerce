"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const review_qna_1 = require("../controller/review_qna");
const product_1 = require("../controller/product");
const user_auth_1 = require("../controller/user_auth");
exports.reviewRouter = express_1.default.Router();
//review's
exports.reviewRouter.get('/review/average-rating/:productId', review_qna_1.averageRating);
exports.reviewRouter.get('/my-reviews', user_auth_1.auth, review_qna_1.getMyReviews);
exports.reviewRouter.post('/post-review', user_auth_1.auth, product_1.product, review_qna_1.postReview);
exports.reviewRouter.put("/review/:review_id", user_auth_1.auth, product_1.product, review_qna_1.editeReview);
exports.reviewRouter.get("/product/review/:productId", review_qna_1.getReviews);
