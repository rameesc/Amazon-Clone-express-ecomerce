
import express from "express"
import { averageRating, editeReview, getMyReviews, getReviews, postReview } from "../controller/review_qna"
import { product } from "../controller/product"
import { auth } from "../controller/user_auth"

export const reviewRouter=express.Router()


//review's
reviewRouter.get('/review/average-rating/:productId',averageRating)
reviewRouter.get('/my-reviews',auth,getMyReviews)
reviewRouter.post('/post-review',auth,product,postReview)

reviewRouter.put("/review/:review_id",auth,product,editeReview)
reviewRouter.get("/product/review/:productId",getReviews)