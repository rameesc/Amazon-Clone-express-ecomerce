import { Request, Response } from "express";
import { Cart } from "../models/Cart";
import { WishList } from "../models/wishlist";



export const addCart = async (req:Request,res:Response)=>{

    try{

        const product=req.product;

        const {quantity,productAttributes}=req.body as {
            quantity:number,
            productAttributes:string

        }

        if(quantity < 1){

            res.json({message:"Quantity is required",status:false})
            return

        }


        let cart = await Cart.findOne(
            {
                user:req.authUser?._id,
                product:product._id
            }
        )

      if(cart && cart.isDeleted==null){

        res.json({message :"cart already exist",status:false})
        return
      }

      if (cart && cart.isDeleted) {

         cart.isDeleted = null
         cart.quantity = quantity
         cart.productAttributes = productAttributes
         await cart.save()

         res.json({cart,message:"add to cart",status:true})
         return
     }

      let newCart = {
        user: req.authUser?._id,
        product: product._id,
        quantity: quantity,
        productAttributes:productAttributes
     };

    await Cart.create(newCart);
   
    res.json({newCart,message:"add to cart",status:true});
    return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}


export const buyNowItem = async (req:Request,res:Response)=>{

    try{

        const product=req.product;

        const {quantity,productAttributes}=req.body as {
            quantity:number,
            productAttributes:string

        }

        if(quantity < 1){

            res.json({message:"Quantity is required",status:false})
            return

        }


        let cart = await Cart.findOne(
            {
                user:req.authUser?._id,
                product:product._id
            }
        )

      if(cart && cart.isDeleted==null){

        res.json({message :"cart already exist",status:true})
        return
      }

      if (cart && cart.isDeleted) {

         cart.isDeleted = null
         cart.quantity = quantity
         cart.productAttributes = productAttributes
         await cart.save()

         res.json({cart,message:"add to cart",status:true})
         return
     }

      let newCart = {
        user: req.authUser?._id,
        product: product._id,
        quantity: quantity,
        productAttributes:productAttributes
     };

    await Cart.create(newCart);
   
    res.json({newCart,message:"add to cart",status:true});
    return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}


type PopulateImages = {
    path:string,
    populate: {
        path: string,
        model:string
    }
}

type PopulateSoldBy = {
    path: string,
    model:string,
    select:string
}

const searchCarts = async (
     keyword = '', 
     id:string, 
     populateImages:PopulateImages,
     populateSoldBy:PopulateSoldBy,
     prepage:number,
     page:number
    ) => {

     let carts = await Cart.find({ user: id, isDeleted: null })
        .limit(prepage)
        .skip(prepage*page)
        .populate(populateImages)
        .populate({
            path: 'product',
            match: {
                name: { $regex: keyword, $options: "i" }
            },
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
        })
        .lean()
    carts = carts.filter(c => c.product !== null)
    let totalCount = carts.length
    // carts = _.drop(carts, perPage * page - perPage)
    // carts = _.take(carts, perPage)
    return ({carts,totalCount})
}


type MyQuerys={
    keyword?:string,
    page?:number

}


export const getCarts = async  (req:Request<{},{},{},MyQuerys>,res:Response)=>{

    try{

        const page=Number(req.query.page)-1

        const perpage=10;

        const keyword = req.query.keyword;

        const populateImages = {
            path:'product',
            populate: {
                path: 'images',
                model:"ProductImages"
            }
        }

        const populateSoldBy = {
            path: 'soldBy',
            model:"Admin",
            select: 'name shopName address'
        }

        let searchedCarts 

        let manualCarts

        const id=req.authUser?._id ||''

        if (keyword) searchedCarts = await searchCarts(keyword, id,populateImages,populateSoldBy,perpage,page)

        if(!keyword) {

         manualCarts = await Cart.find({ user: req.authUser?._id, isDeleted: null })
                  .limit(perpage)
                  .skip(perpage*page)

         .populate(populateImages)
         .populate({
            path: 'product',
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
         })
         .lean()
        }

        const totalCount = (manualCarts && manualCarts.length) || (searchedCarts && searchedCarts.totalCount)

        let carts = manualCarts || searchedCarts?.carts

         let totalAmount = 0
         let realRate=0
         

         carts?.forEach(c=>{
            console.log(c)
           realRate+= c.product.price-c.product.price*(c.product.discountRate/100)

         totalAmount += parseFloat(c.product.price)

        })

        const pagination=Math.ceil(Number(totalCount)/perpage)
    
    
       res.json({ carts, totalCount ,totalAmount,realRate,pagination,status:true})
       return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}

export const deleteCart = async(req:Request,res:Response)=>{

    try{

        let cart = await Cart.findOne({ _id: req.params.cart_id, user: req.authUser?._id })

        if (!cart) {
             res.json({message: 'Cart not found.',status:true })
             return
        }

        cart.isDeleted = Date.now()
        await cart.save()

        res.json({cart,message:"cart removed",status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}

export const editCart=async(req:Request,res:Response)=>{

    try{
        let cart = await Cart.findOne({ _id: req.params.cart_id, user: req.authUser?._id, isDeleted: null })

     if (!cart) {
        res.json({ message: 'Cart not found.' ,status:false})
        return
     }

     if(req.query.quantity=='add'){

        if(cart.quantity>=3){
            res.json({message:"only add maximam 3 quantity",status:true})
            return
        }

        cart.quantity +=1
        await cart.save()
     }
     if(req.query.quantity=='less'){

        if(cart.quantity==1){
            res.json({message:"minimam quantity 1",status:true})
            return
        }

        cart.quantity -=1
        await cart.save()
     }
   

     res.json({cart,status:true,message:"successfullt added"})
     return

    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}

export const addwishlist=async(req:Request,res:Response)=>{

    try{

        const product=req.product;

        const {
            quantity
        }=req.body

        if (quantity < 1) {
            res.json({message: 'Quantity is required',status:false })
            return
        }

        let wishlist = await WishList.findOne({user:req.authUser?._id, product: product._id })

        if (wishlist && wishlist.isDeleted===null) {

          res.json({message: 'Wishlist already exist.',status:false })
          return
        }
        
        if (wishlist && wishlist.isDeleted) {

            wishlist.isDeleted = null
            wishlist.quantity = quantity
            await wishlist.save()

             res.json({status:true,message:"Add TO wishlist"})
             return
        }
        let newWishlist = {
            user: req.authUser?._id,
            product: product._id,
            quantity: quantity
        };
       
        await WishList.create(newWishlist)
        res.json({status:true,message:"add TO wishlist"});


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}





const searchWishlists = async (
    keyword = '', 
    id:string,
     populateImages:PopulateImages, 
     populateSoldBy:PopulateSoldBy,
     page:number,
     prePage:number
    ) => {

    let wishlists = await WishList.find({ user: id,isDeleted:null })
         .limit(prePage)
         .skip(prePage*page)
        .populate(populateImages)
        .populate({
            path: 'product',
            match: {
                name: { $regex: keyword, $options: "i" }
            },
            select: 'name slug images soldBy discountRate price quantity',
            populate: populateSoldBy
        })
        .lean()

     wishlists = wishlists.filter(c => c.product !== null)

    let totalCount = wishlists.length
    // wishlists = _.drop(wishlists, perPage * page - perPage)
    // wishlists = _.take(wishlists, perPage)
    return ({ wishlists, totalCount })
}

export const getWishlists=async(req:Request<{},{},{},MyQuerys>,res:Response)=>{

    try{

        const keyword = req.query.keyword

        const prePage=10
        const page=Number(req.query.page)-1

        const populateImages = {
            path: 'product',
            populate: {
                path: 'images',
                model: 'ProductImages'
            }
        }
        const populateSoldBy = {
            path: 'soldBy',
            model: 'Admin',
            select: 'name shopname address'
        }
        let searchedWishlists
        let manualWishlists

        const id=req.authUser?._id || ''

        if (keyword) searchedWishlists = await searchWishlists(keyword, id, populateImages, populateSoldBy,page,prePage)

        if (!keyword) {

            manualWishlists = await WishList.find({ user: id, isDeleted: null })
             .limit(prePage)
             .skip(prePage*page)

                .populate(populateImages)
                .populate({
                    path: 'product',
                    select: 'name slug images soldBy discountRate price quantity',
                    populate: populateSoldBy
                })
                .lean()
        }
         const totalCount = (manualWishlists && manualWishlists.length) || (searchedWishlists && searchedWishlists.totalCount)

         let wishlists = manualWishlists || searchedWishlists?.wishlists

        //  let totalAmount = 0

        //  wishlists?.forEach(c => {
        //     totalAmount += parseFloat(c.product.price)
        //  })

         const pagination=Math.ceil(Number(totalCount)/prePage)
    
       
         res.json({ wishlists, totalCount,pagination,status:true})
         return
    


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}


export const deleteWishlist=async(req:Request,res:Response)=>{

    try{

        const id= req.authUser?._id

        let wishlist = await WishList.findOne({ _id: req.params.wishlist_id, user: id })

        if (!wishlist) {
             res.json({ message: 'Wishlist not found.' ,status:false})
             return
        }

        wishlist.isDeleted = Date.now()
        await wishlist.save()
        
        res.json({message:'Item Removed from wishList',status:true})


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}


export const editWishlist=async(req:Request,res:Response)=>{

    try{

        let wishlist = await WishList.findOne({ _id: req.params.wishlist_id, user: req.authUser?._id, isDeleted: null })

     if (!wishlist) {

         res.json({message: 'Wishlist not found.',status:false })
         return
     }
      wishlist.quantity = Number(req.query.quantity)

      await wishlist.save()

      res.json({wishlist,status:true})


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false})
            return
        }
    }
}