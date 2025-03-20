import { Request, Response } from "express";
import { Order } from "../models/Orderschema";
import { Review } from "../models/Review";
import { getRatingInfo } from "../middleware/user_action/getRatingInfo";
import { Product } from "../models/Product";



export const postReview=async(req:Request,res:Response)=>{

    try{

        let product = req.product

       

      if (!product.isVerified && product.isDeleted) {
          res.json({ message: 'Product not found' ,status:false})
          return
      }

    if (!req.body.star ) {
        res.json({ message: 'Rating is required.',status:false })
        return
    }

    if (req.body.star && (req.body.star > 5 || req.body.star < 1)) {
        res.json({ message: "Rating should be in range of 0 and 5",status:false });
        return
    }
    //ckeck if user has bought this product or not
    const orders = await Order.findOne({
        user: req.authUser?._id,
        'status.currentStatus': { $in: ['complete', 'return'] },
        product: product._id
    })
    if (!orders) {
        res.json({message: "You have not bought this product.",status:false })
        return
    }
    //check if user has already given star or comment
    const review = await Review.findOne({
        user: req.authUser?._id,
        product: product._id
    })

    if (review && review.comment && req.body.comment) {
      res.json({message:"You have already commented on this product.",status:false })
      return
    }
    if (review && review.star && req.body.star) {
        res.json({status:false , message: "You have already rated on this product." })
        return
    }

    let newReview = {
        user: req.authUser?._id,
        product: product._id,
        comment: req.body.comment,
        star: req.body.star
    };
    let newRevie = new Review(newReview);
    let stars =  await getRatingInfo(product,newReview.star)
    
    let updateProduct =await Product.findById(product._id)
    updateProduct.totalRatingUsers = stars.totalRatingUser
    updateProduct.averageRating = stars.averageStar
     
   await updateProduct.save()
   await newRevie.save()
    
    res.json({newReview,status:true,message:'Thanks for you feedback'});
    return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const editeReview=async(req:Request,res:Response)=>{

    try{

        let product = req.product

     if (!product.isVerified && product.isDeleted) {
         res.json({message: 'Product not found',status:false })
         return
     }
    if (!req.body.star) {
        res.json({ message: 'Rating is required.',status:false })
        return
    }
    if (req.body.star && (req.body.star > 5 || req.body.star < 1)) {
        res.json({ message: "Rating should be in range of 1 and 5",status:false });
        return 
    }
    //ckeck if user has bought this product or not
    const orders = await Order.findOne({
        user: req.authUser?._id,
        'status.currentStatus': { $in: ['complete', 'return'] },
        product: product._id
    })
    if (!orders) {
       res.json({status:false, message: "You have not bought this product." })
       return 
    }
    //check if user has already given star and comment
    let review = await Review.findById(req.params.review_id)

    if (!review) {
         res.json({status:false, message:'Review not found'})
         return
    }
  
    review.comment = req.body.comment
    review.star = req.body.star

    let stars = await getRatingInfo(product, +review.star)

   let updateProduct = await Product.findById(product._id)
  
    updateProduct.totalRatingUsers = stars.totalRatingUser
    updateProduct.averageRating = stars.averageStar
    
    await updateProduct.save()
    await review.save()

    res.json({review,status:true});
    return

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}

export const getReviews=async(req:Request,res:Response)=>{

    try{

        const page = Number(req.query.page)-1
        const perPage =  10;
       // const product = req.product

        const {productId}=req.params

        

        const product = await Product.findOne({_id:productId})

        

      if (!product.isVerified && product.isDeleted) {
         res.json({message: 'Product not found',status:false })
         return
     }
     const reviews = await Review.find({ product:product?._id })
        .populate('user', 'name  photo')
        .skip(perPage * page )
        .limit(perPage)
        .lean()

        
   
    const totalCount = await Review.countDocuments({ product: product._id })

    const pagination=Math.ceil(Number(totalCount/perPage))
    console.log(reviews,totalCount,pagination,20)

    res.json({ reviews, totalCount ,pagination,status:true});
    return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }


}
export const getMyReviews=async(req:Request,res:Response)=>{

    try{

        const page = Number(req.query.page)-1
        const perPage =  10;

       

        const myReviews = await Review.find({ user: req.authUser?._id })

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
                select:'shopName'
            }
        })
        .skip(perPage * page )
        .limit(perPage)
        .lean()
    // if (!myReviews.length) {
    //     return res.status(404).json({ error: "No reviews found" });
    // }
    const totalCount = myReviews.length

    const pagination=Math.ceil(Number(totalCount/perPage))

    res.json({ myReviews, totalCount ,pagination,status:true});
    return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }

    


}

export const averageRating = async (req:Request, res:Response)=>{

    try{
        const {productId}=req.params

        const isProduct=await Product.findOne({_id:productId})


        if(!isProduct){

            res.json({message:"product not found",status:true})
            return
        }

        let stars = await getRatingInfo(isProduct,0)
        
        res.json({stars,status:true})
        return


    }catch(error:unknown){

     if(error instanceof Error){
        res.json({message:error.message,status:false})
        return
     }

    }
}