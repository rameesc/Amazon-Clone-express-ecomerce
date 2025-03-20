import { NextFunction, Request, Response } from "express"
import { Product } from "../models/Product";
import { getRatingInfo } from "../middleware/user_action/getRatingInfo";
import { CategoriesProps, FilesProps,  ProductBrandProps, ProductImagesProps, ProductProps } from "../types/types";
import { fileRemoved } from "../middleware/helpers/fileRemover";
import { ProductImages } from "../models/productImages";

import { Order } from "../models/Orderschema";

import { SuggestKeyword } from "../models/suggestKeyword";
import { Category } from "../models/Category";
import { ProductBrand } from "../models/productBrand";




export const product =async(req:Request,res:Response,next:NextFunction)=>{

    try{

        const {productId}=req.body

        const product = await Product.findOne({_id:productId})
        .populate("images")
        .populate("soldBy")
        .populate("brand")
        .populate({
            path:"category",
            populate:{
                path:"parent",
                model:"Category",

            
            }
        })

       

        if (!product) {
            res.json({message: "Product not found." ,status:false});
            return
          }
          req.product = product;

        

          next();


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false});
            return
        }
    }
}

export  const getProduct =async(req:Request,res:Response)=>{


    try{

        let role= req.authUser?.role ||"user"

        const isProduct=await Product.findOne({_id:req.product._id})

        if(role=="user" && (!req.product.isVerified  || req.product.isDeleted)){

          res.json({message:"product has been deleted.",status:false})
          return
      }

      if(role=='admin'&& req.product.isDeleted){

          res.json({message:"product has been deleted.",status:false})
          return
      }

      if(role=='user'){
          req.product.viewsCount+=1
      }
  
      await getRatingInfo(isProduct,0)

      res.json({isProduct,status:true})
      return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false});
            return
        }
    }
}

type OptionItme={
  value:string
  label:string
}
export const createProduct=async(req:Request,res:Response)=>{

    try{

        const {
            name,
            price,
            quantity,
            discountRate,
            description,
            brand,
            category,
            warranty,
            Return,
            color,
            weight,
            size,
            availableDistricts,
            videoURL,
            highlights

        }=req.body

      

        if(!req.admin.isVerified){

            res.json({message:"admin is not verified",status:false})
            return

        }

       if(req.admin.role!=='superadmin'){

        req.body.isFeatured=null;
        req.body.isVerified=null

       }

       if(req.admin.role=='superadmin'){

          if(req.body.isFeatured){

            req.body.isFeatured=Date.now()

          }

          req.body.isVerified=Date.now()

       }

        if(!name){

          res.json({message:"product name required",status:false})
          return
        }
        if(!price){

          res.json({message:"product price required",status:false})
          return
        }
        if(!quantity){

          res.json({message:"product quantity required",status:false})
          return
        }
        if(!description){

          res.json({message:"product description required",status:false})
          return
        }
        if(!warranty){

          res.json({message:"product warranty required",status:false})
          return
        }

        
        if(!Return){

          res.json({message:"product return required",status:false})
          return
        }
        if(!availableDistricts){

          res.json({message:"product availableDistricts required",status:false})
          return
        }
        
        // brand id map
        const brandIds=brand?.map((item:OptionItme)=>item.value)

        const isBrand=  await ProductBrand.find({_id:{$in:brandIds}})

       if(!isBrand){

        res.json({message:"Invalid brand",status:false})
        return
       }

       // cotegory map get id

       const categoryIds=category?.map((item:OptionItme)=>item?.value)

       const isCategory=await Category.find({_id:{$in:categoryIds}})

       if(!isCategory){

         res.json({message:"Invalid categories",status:false})
         return

       }

       let createProduct= await Product.create({
           name,
           brand:isBrand?.map((b)=>b?._id),
           quantity:Number(quantity),
           category:isCategory.map((c)=>c._id),
           warranty,
           return:Return,
           
           slug:Math.random(),
           soldBy:req.admin._id,
           size:size && size.map((i:OptionItme)=>i?.label),
           color:color &&color.map((c:OptionItme)=>c?.label),
           weight:weight && weight.map((w:OptionItme)=>w?.label),
           description,
           videoURL:videoURL && videoURL.map((v:string)=>v),
           highlights:highlights,
           price:Number(price),
           discountRate:discountRate ? Number(discountRate): 0,
           availableDistricts:availableDistricts.map((d:OptionItme)=>d?.label)
       });


       res.json({createProduct,status:true,message:"created new  product"})
       return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false});
            return
        }
    }
}

export const deleteProduct=async(req:Request,res:Response)=>{


    try{

        const isProduct= await Product.findOne({_id:req.params.productId})


        if(!isProduct){

            res.json({message:"product not found",status:false})
            return
        }

        isProduct.isDeleted=Date.now();
        isProduct.isVerified=null;
        isProduct.isFeatured=null;
        isProduct.isRejected=null;

        await isProduct.save()

        res.json({isProduct,status:true,message:"Deleted One"})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false});
            return
        }
    }
}
export const productImages = async (req:Request,res:Response)=>{


    try{
    

        if(!req.files?.length){

            res.json({message:"product images are required",status:false})
            return
        }
    
        let files=[]
    
    
    
        if(!req.admin.isVerified){
    
            
          files=(req.files as FilesProps[]).map((file:FilesProps)=>`public/uploads/product/${file?.filename}`)
    
          fileRemoved(files)
    
          res.json({message:"admin is not verified",status:false})
          return;
           
    
        }
        const imageId:string[]=[]

        let imagesProduct= (req.files as FilesProps[]).map(async(file)=>{

            let image= new ProductImages();

           
            const path=file?.filename

            image.large=path;
            image.thumbnail=path;
            image.medium=path;
            image.productLink=req.params.productId

             await image.save()
           
           imageId.push(image._id)
           return  image


        })
      
          
        imagesProduct= await Promise.all(imagesProduct) 

       
          console.log(imageId,10)

        const updateImage=await Product.findByIdAndUpdate(req.params.productId,{
           images:imageId

        })

       res.json({updateImage,status:true,message:"uploaded Images"})
       return
    



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }

    
}

export  const deleteImage=async(req:Request,res:Response)=>{


    try{

        let product=req.product

         
        let isProduct=await Product.findOne({_id:product._id})
        .populate("images")
        .populate("soldBy")
        .populate("brand")
        .populate({
            path:"category",
            populate:{
                path:"parent",
                model:"Category",

            
            }
        })


        if(product.isVerified){

            res.json({message:"cannot delete image. Product has already been verified.",status:false})
            return
        }

        let imageFound={} as ProductImagesProps 

      isProduct.images=  product.images.filter((img)=>{
            if(img._id.toString()===req.query.image_id){

                imageFound=img

            }
            return img._id.toString()!==req.query.image_id
        })

        if(!imageFound){
            res.json({message:"image not found",status:false})
            return
        }

        await  isProduct.save()

        await ProductImages.deleteOne({_id:imageFound._id})
         
          let files=[
            `public/uploads/product/${imageFound.large}`,
            `public/uploads/product/${imageFound.medium}`,
            `public/uploads/product/${imageFound.thumbnail}`,
        ]

            fileRemoved(files)

        res.json({isProduct,status:true})
        return;



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

export const deleteImageById=async(req:Request,res:Response)=>{


    try{
        

        let image= await ProductImages.findByIdAndDelete(req.query.image_id)

        if(!image){

            res.json({message:"image not found",status:false})
            return
        }

        let files=[
            `public/uploads/product/${image.thumbnail}`,
            `public/uploads/product/${image.medium}`,
            `public/uploads/product/${image.large}`,
        ]

        fileRemoved(files)

        res.json({image,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

export const updateProduct=async(req:Request,res:Response)=>{


    try{

      const {
        name,
        price,
        quantity,
        discountRate,
        description,
        brand,
        category,
        warranty,
        Return,
        color,
        weight,
        size,
        availableDistricts,
        highlights

      }=req.body?.values

        let product=req.product;
        console.log(req.body?.values?.category[0]?.value,10)

        if(product.isVerified){

            res.json({message:"cannot update. product has already been verified",status:false});
            return


        }

        if(!name){

          res.json({message:"product name required",status:false})
          return
        }
        if(!price){

          res.json({message:"product price required",status:false})
          return
        }
        if(!quantity){

          res.json({message:"product quantity required",status:false})
          return
        }
        if(!description){

          res.json({message:"product description required",status:false})
          return
        }
        if(!warranty){

          res.json({message:"product warranty required",status:false})
          return
        }

        
        if(!Return){

          res.json({message:"product return required",status:false})
          return
        }
        if(!availableDistricts){

          res.json({message:"product availableDistricts required",status:false})
          return
        }

        // brand map get id

        const brandIds=brand?.map((item:OptionItme)=>item.value)

        const isBrand=  await ProductBrand.find({_id:{$in:brandIds}})

       if(!isBrand){

        res.json({message:"Invalid brand",status:false})
        return
       }

       // cotegory map get id

       const categoryIds=category?.map((item:OptionItme)=>item?.value)

       const isCategory=await Category.find({_id:{$in:categoryIds}})

       if(!isCategory){

         res.json({message:"Invalid categories",status:false})
         return

       }

        await Product.findByIdAndUpdate(product._id,{
          name,
          brand:isBrand?.map((b)=>b?._id),
          quantity:Number(quantity),
          category:isCategory.map((c)=>c._id),
          warranty,
          return:Return,
       
          size:size && size.map((i:OptionItme)=>i?.label),
          color:color &&color.map((c:OptionItme)=>c?.label),
          weight:weight && weight.map((w:OptionItme)=>w?.label),
          description,
          highlights:highlights,
          price:Number(price),
          discountRate:discountRate ? Number(discountRate): 0,
          availableDistricts:availableDistricts.map((d:OptionItme)=>d?.label)
        });

        res.json({message:"product updated",status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}



export const getProducts=async(req:Request,res:Response)=>{


    try{

        const page=Number(req.query.page)-1

        const prepage=10;

        let query:Record<string,any> = { 
            soldBy: req.admin._id, 
            isDeleted: null ,
           
        } as {
          
        }
        

      

        const {
            createdAt,
            updatedAt,
            outofstock,
            price,
            status,
            keyword,
           
        }=req.query


        let sortFactor={}
      

        if (createdAt && (createdAt === 'asc' || createdAt === 'desc')) sortFactor = { ...sortFactor, createdAt }

        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc')) sortFactor = { ...sortFactor, updatedAt }

        if (price && (price === "1" || price === "-1")) sortFactor = { price: price == "1" ? 1 : -1 }

       

        if (keyword) query = {
          ...query,
          name: { $regex: keyword, $options: "i" }
        }
        if (status && status === 'verified') query = {
          ...query,
          isVerified: { $ne: null }
        }
        if (status && status === 'unverified') query = {
          ...query,
          isVerified: null
        }
        if (status && status === 'rejected') query = {
          ...query,
          isRejected: { $ne: null }
        }
        if (outofstock && outofstock === 'yes') query = {
            ...query,
            quantity: 0
          }
        
        let products=await Product.find(query)
        .populate('brand')
        .populate("category")
        .populate("soldBy")
        .populate("images")
        .skip(prepage*page)
        .limit(prepage)
        .sort(sortFactor)

        const totalCount=products.length

        const pagination=Math.ceil(Number(totalCount/prepage))
        
        res.json({products,status:true,pagination,totalCount})
        return




    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }

}

export const getSingleProduct=async(req:Request,res:Response)=>{

  try{

    const {productId}=req.params

  

    let isProduct=await Product.findOne({_id:productId})
        .populate('brand')
        .populate("category")
        .populate("soldBy")
        .populate("images")


        if(!isProduct){

          res.json({message:"product not found",status:false})
          return

        }

        res.json({isProduct, status:true})
        return
        


  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}
export const isFeatureProduct=async(req:Request,res:Response)=>{

  try{

    
   const query={
    isFeatured:{$ne:null},
    isRejected:null,
    isDeleted:null


   }
    let isProduct=await Product.find(query)
        .populate('brand')
        .populate("category")
        
        .populate({
          path: "soldBy",
          select:"name shopName address isVerified isBlocked holidayMode photo email",
          populate: {
            path: "adminWareHouse",
            model: "AdminWareHouse",
          },
        })
        .populate("images")


        if(!isProduct){

          res.json({message:"product not found",status:false})
          return

        }

        res.json({isProduct, status:true})
        return
        


  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

export const minedProduct=async(req:Request,res:Response)=>{


    try{

        const page=Number(req.query.page)-1

        const perpage=10;

        let query = { 
            isVerified: { $ne: null },
            isDeleted: null ,
           
        } as {
          
        }
        let productLength=await Product.find(query).countDocuments()

        const pagination=Math.ceil(Number(productLength/perpage))

        let sortFactor={};

        if (req.header('district')) {
            query = {
              ...query,
              availableDistricts: { $in: req.header('district')}
            }
          }

        if (req.query.keyword === 'latest') {

            sortFactor = { createdAt: 'desc' }
        }
        else if (req.query.keyword === 'featured') {

            sortFactor = { createdAt: 'desc' }

            query = {
              ...query,
              isFeatured: { $ne: null }
            }
        }

        else if (req.query.keyword === 'trending') {
            sortFactor = { trendingScore: -1 }
          }
          else if (req.query.keyword === 'mostviewed') {
            sortFactor = { viewsCount: -1 }
          } 
          else if (req.query.keyword === 'topselling') {
            sortFactor = { noOfSoldOut: -1 }
          } 
          else {
           res.json({message: "Invalid keyword.",status:false})
           return
          }

          let products = await Product.find(query)

          .populate("category", "displayName slug")
          .populate("brand", "brandName slug")
          .populate("images", "-createdAt -updatedAt -__v")
          .skip(perpage * page )
          .limit(perpage)
          .lean()
          .sort(sortFactor);

          res.json({products,status:true,pagination})
          return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

export  const forYouProducts=async(req:Request,res:Response)=>{


    try{

        const page=Number(req.query.page)-1
        const perpage=10

        const { createdAt, updatedAt, price } = req.query

        let sortFactor = {  };

        if (createdAt && (createdAt === 'asc' || createdAt === 'desc')) sortFactor = { createdAt }

        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc')) sortFactor = { updatedAt }

        if (price && (price === 'asc' || price === 'desc')) sortFactor = { price: price === 'asc' ? 1 : -1 }


        const orders = await Order.find({ user: req.authUser?._id })

        .select('-_id product')
        .populate({
          path: 'product',
          select: '-_id category',
          populate: {
            path: 'category',
            model: 'category',
            select: '_id ',
            match: {
              isDisabled: null
            },
            populate: {
              path: 'parent',
              model: 'category',
              select: '_id ',
              match: {
                isDisabled: null
              },
              populate: {
                path: 'parent',
                model: 'category',
                select: '_id ',
                match: {
                  isDisabled: null
                },
              }
            }
          }
        });

        let categories:string[] = []

        orders.forEach(o=>{
            o.product.category.forEach((cat:CategoriesProps)=>{

                categories.push(cat._id)//i.e last layer
                cat.parent && categories.push(cat.parent._id) //i.e second layer
                // cat.parent.parent && categories.push(cat.parent.parent._id) //i.e first layer
            })
        })

        categories =[... new Set(categories)]

            if (!categories.length) {
             res.json({message: "Categories not found." ,status:false});
             return
            }
        
        let query ={
            category:{$in:categories}
        }as {}


        if(req.header("district")){

            query ={
                ...query,
                availableDistricts:{$in:req.header("district")}

            }
        }

        let products = await Product.find(query)

         .populate("category")
         .populate("brand")
         .populate("images", "-createdAt -updatedAt -__v")
         .skip(perpage*page)
         .limit(perpage)
         .lean()
         .sort(sortFactor);

        const totalCount = await Product.countDocuments(query);


        res.json({products,totalCount,status:true})
        return
    


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}


export const suggestKeywords=async(req:Request,res:Response)=>{

    try{

        let limits=Number(req.query.limits) ||5

        let suggestedKeywords = await SuggestKeyword
        .find({ keyword: { $regex: req.query.keyword || '', $options: "i" }, isDeleted: null })
        .select('-_id keyword')
        .limit(limits)
      suggestedKeywords = suggestedKeywords.map(s => s.keyword)


      res.json({suggestedKeywords,status:true})
      return

    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

export const searchProducts=async(req:Request,res:Response)=>{

    try{

        const page=Number(req.params.page)-1

        const perpage=10

        const { createdAt, updatedAt, price } = req.query

        let sortFactor = {  };

      if (createdAt && (createdAt === 'asc' || createdAt === 'desc')) sortFactor = { createdAt }

      if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc')) sortFactor = { updatedAt }

      if (price && (price === 'asc' || price === 'desc')) sortFactor = { price:price==='asc' ? 1 : -1 }

        let {
          brands,
          max_price,
          min_price,
          sizes,
          ratings,
          colors,
          
          discount,
          weights,
          cat_id,
          keyword = "",
        } = req.query;
       
        

       let categories;

        if (cat_id) {
         categories = await Category.find({
         $or: [{ _id: cat_id }, { parent: cat_id }],
          isDisabled: null,
         });

         if (!categories.length) {
           res.json({ error: "Categories not found." ,status:false});
           return
         }
        }

        let searchingFactor:any={
          isVerified:{ $ne: null },
          isDeleted:null

        } 

        if (keyword && !cat_id) {
         //that is if only with keyword
         

         

         searchingFactor={
          ...searchingFactor,
              $or:[
                { name: { $regex: keyword, $options: "i" } },
                { tags: { $regex: keyword, $options: "i" } },
                ]
         }
          if (brands) searchingFactor={brand:brands};

          if (max_price && min_price){
            searchingFactor.price={ $lte: +max_price, $gte: +min_price }
          }else if(min_price){
            searchingFactor.price={$gte:min_price}
          }


         if (sizes) searchingFactor.size={$in:sizes}

         if( discount) searchingFactor.discountRate=Number(discount)

         if (colors) 
          searchingFactor.color={ $in: colors }
            

         if (weights) searchingFactor.weight={ $in: weights };

        //  if (warranties) searchingFactor={ ...searchingFactor,warranty:warranties}

        

         if (ratings) searchingFactor.averageRating={ $gte: Number(ratings)} ;

        } else {

          if (brands) searchingFactor={brand:brands};
         
          if(cat_id){
            searchingFactor.category={$in:[cat_id]}
          }

          if (max_price&& min_price ){
            searchingFactor.price={ $lte:+max_price, $gte:+min_price}
          }


          if (sizes) searchingFactor.size={$in:sizes}

          if( discount) searchingFactor.discountRate= Number(discount)

          if (colors) 
          searchingFactor.color={ $in: colors }
            

          if (weights) searchingFactor.weight={ $in: weights };

        //  //  if (warranties) searchingFactor={ ...searchingFactor,warranty:warranties}

        

           if (ratings) searchingFactor.averageRating={ $gte:+ratings} ;
        }
         if (req.header('district')) {

           searchingFactor={
            ...searchingFactor,
            availableDistricts:{ $in: req.header('district') }}
         }

         if(!searchingFactor){
          res.json({message:"data not found",status:false})
          return
         }
         
         let products = await Product.find(searchingFactor)


         .populate("category")
         .populate("brand")
         .populate("images")
         .skip(perpage*page)
         .limit(perpage)
         .lean()
         .sort(sortFactor)

         
         
         let totalCount = await Product.countDocuments(searchingFactor);

         const pagination=Math.ceil(Number(totalCount/perpage))


         res.json({products,pagination,totalCount,status:true})
         return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}


export const getProductsByCategory = async (req:Request, res:Response)=>{

    try{

        const page=Number(req.query.page)-1

        const perpage=10;

        const { createdAt, updatedAt, price } = req.query

        let sortFactor = {};

        if (createdAt && (createdAt === 'asc' || createdAt === 'desc')) sortFactor = { createdAt }

        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc')) sortFactor = { updatedAt }

        if (price && (price === 'asc' || price === 'desc')) sortFactor = { price: price === 'asc' ? 1 : -1 }

        let categories = await Category.find({

          $or: [{ _id: req.query.category_id }, { parent: req.query.cat_id }],

          isDisabled: null,
        });

       if (!categories.length) {

             res.json({message: "Categories not found",status:false });
             return
        }

        let query = {
            category: { $in: categories },
            isVerified: { $ne: null },
            isDeleted: null
          } as {}

          if (req.header('district')) {

             query = {
              ...query,
              availableDistricts: { $in: req.header('district') }
             }
          }

          categories = categories.map((c) => c._id.toString())

          let products = await Product.find(query)

          .populate("category")
          .populate("brand")
          .populate("images")
          .skip(perpage * page )
          .limit(perpage)
          .lean()
          .sort(sortFactor);

          const totalCount = await Product.countDocuments(query);

          const pagination=Math.ceil(Number(totalCount/perpage))



          res.json({products,totalCount,status:true,pagination})
          return



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}


export const generateFilter =async(req:Request,res:Response)=>{


    try{

        const filterGenerate = (products:ProductProps[]) => {

            let filters = {
                sizes: [],
                brands: [],
                warranties: [],
                colors: [],
                weights: [],
                prices: [],
                ratings: [5, 4, 3, 2, 1],
                discount:[]
              } as {
                sizes:string[],
                brands:ProductBrandProps[],
                warranties:string[],
                colors:string[],
                weights:string[],
                prices:number[],
                ratings:number[],
                discount:number[]
              }

              products.forEach((p:ProductProps) => {

                if (
                  !filters.brands.some((brand) => p.brand.brandName === brand.brandName)
                )
                  filters.brands.push(p.brand);

                if (!filters.warranties.some((w) => p.warranty === w))
                  filters.warranties.push(p.warranty);

                if (!filters.prices.some((price) => p.price === price))
                  filters.prices.push(p.price);

                p.size.forEach((size) => {
                  if (!filters.sizes.includes(size)) filters.sizes.push(size);
                });

                p.color.forEach((color) => {
                  if (!filters.colors.includes(color)) filters.colors.push(color);
                });

                p.weight.forEach((weight) => {
                  if (!filters.weights.includes(weight)) filters.weights.push(weight);
                });
                

                if(!filters.discount.some((num)=>p.discountRate==num)) filters.discount.push(p.discountRate)
              });


               //making price range =>[[min,max],[min1,max1]]7
               

                let min_price = Math.min(...filters.prices);
                let max_price = Math.max(...filters.prices);

               

                function minmax(min:number, max:number):number[] {
                    let M;
                    let m;
                    if (max < 100) M = 100;
                    if (max > 100) M = max + (100 - (max % 100));
                    if (max % 100 === 0) M = max + 100;
                    if (min < 100) m = 0;
                    if (min > 100) m = min - (min % 100);
                    if (min % 100 === 0) m = min - 100;

                    return [m, M] as number[];
                  } 
                  filters.prices = minmax(min_price??0,max_price??0);
                  console.log(filters,'price')
                  return filters;
                

        };
       

        if(req.query.keyword){

            let products

            let sortFactor={
                createdAt: 'desc'
            } as {}

            if(req.query.keyword=='latest'){

                products=await Product.find({
                    isVerified: { $ne: null },
                    isDeleted: null,
                })
                .limit(50)
                .sort(sortFactor)
                .populate("brand")
                .select("-_id brand warranty size color weight price discountRate");

                let generatedFilters = filterGenerate(products);

                res.json({generatedFilters,status:true})
                return
            }

            products = await Product.find({
                $or: [
                  { name: { $regex: req.query.keyword, $options: "i" } },
                  { tags: { $regex: req.query.keyword, $options: "i" } },
                ],
                isVerified: { $ne: null },
                isDeleted: null,
              })
              .populate("brand")
              .select("-_id brand warranty size color weight price discountRate");

              let generatedFilters = filterGenerate(products);

              res.json({generatedFilters,status:true})
              return
        }else{

          


             //else by category
          let categories = await Category.find({
           $or: [{ _id:req.query.cat_id }, { parent: req.query.cat_id }],
            
           isDisabled:null
          });

          

          if (!categories.length) {

              res.json({message: "Category not found. Cannot generate filter.",status:false });
              return
          }

           categories = categories.map((c) => c._id.toString());
            const products = await Product.find({
            category: { $in:categories },
            isVerified: { $ne: null },
            isDeleted: null,
            })
            
            .populate("brand")
            .select("-_id brand warranty size color weight price discountRate");
           
            let generatedFilters = filterGenerate(products);

           res.json({generatedFilters,status:true});
           return 


        }



    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message,status:false})
            return
        }
    }
}

