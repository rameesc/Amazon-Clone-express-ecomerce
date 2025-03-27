import { Request, Response } from "express";
import { Admin } from "../models/adminschema";
import { Product } from "../models/Product";
import fs from "fs"
import { Banner } from "../models/banner";
import { Lead } from "../models/Lead";
import { Dispatch } from "../models/dispatcher";
import { dispatcherValidate } from "../schema";
import bcrypt from "bcryptjs"
import { Businessinfo } from "../models/business-info";
import { AdminBank } from "../models/adminBank";
import { AdminWareHouse } from "../models/AdminWareHouse";
import { User } from "../models/userModelsSchema";
import { Category } from "../models/Category";
import { CategoriesProps } from "../types/types";
import { SuggestKeyword } from "../models/suggestKeyword";
import { District } from "../models/districts";
import { Remark } from "../models/Remark";
import { ProductBrand } from "../models/productBrand";

import { removeImageFile } from "../middleware/helpers/fileRemover";




export const geoLocation=async(req:Request,res:Response)=>{

    try{
        let superadmin= req.admin
        const {lat,long}=req.body;

        if(lat && long){

            let geolocation={
                type:"point",
                coordinates:[lat,long]
            }

            await Admin.findByIdAndUpdate(superadmin._id,geolocation)

            res.json({superadmin,status:true})
            return
        }

        res.json({message:"please add latitude longitud"})
        return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const getGeoLocation=async(req:Request,res:Response)=>{


    try{
        let superadmin= req.admin

        if(!superadmin){
            res.json({message:'cannot find geoLocation',status:false})
            return
        }

        res.json({superadmin,status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const  shippingData=async(req:Request,res:Response)=>{

    try{


        let superadmin =req.admin ;

        const {shippingRate, shippingCost}=req.body

        if(shippingCost && shippingRate){


          const shipping=  await Admin.findByIdAndUpdate(superadmin._id,{
                shippingRate,
                shippingCost
            })

           res.json({shipping,status:true})
           return;
           

        }

        res.json({message:"shipping coat and shipping rate required",status:false})
           return;

        



    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const getShippingData=async(req:Request,res:Response)=>{


    try{

        const superadmin=req.admin;

        if(!superadmin){

            res.json({message:"shipping rate not found",status:false});
            return;
        }

        res.json({superadmin,status:true})
        return;


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const banner =async(req:Request,res:Response)=>{

    try{
        const {productId,link}=req.body

       

        if(!req.file){

            res.json({message:"banner image required",status:false})
            return
        }

        let product=await Product.findOne({
            _id:productId,
            isVerified:{$ne:null},
            isDeleted:null
        })

        if(!product){
            const {filename}=req.file

            const path=`public/uploads/banner/${filename}`

            fs.unlinkSync(path) //remove banner image if not product

            res.json({message:"product not found",status:false});
            return

        }

        //image compress
        //--------------
        const {filename}=req.file

       const newBanner= await Banner.create({
            bannerPhoto:filename,
            product:product._id,
            link:link


        })

        res.json({message:"banner created",newBanner,status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const editeBanner =async(req:Request,res:Response)=>{

    try{
        const {banner_id,productId,link}=req.body;
       
        let banner =await Banner.findById(banner_id)

        if(!banner){

            if(req.file){
                const {filename}=req.file

                const path=`public/uploads/banner/${filename}`

                fs.unlinkSync(path);

            }
            res.json({message:"banner not found",status:false});
            return;
        }

        let product=await Product.findOne({
            _id:productId,
            isVerified:{$ne:null},
            isDeleted:null
        })

        if(!product){

            if(req.file){

                const {filename}=req.file

              const path=`public/uploads/banner/${filename}`

              fs.unlinkSync(path) //remove banner image if not product

            }

            res.json({message:"product not found",status:false});
             return
            

        }
        banner.product=product._id;

        if(req.file){

            const {filename}=req.file


             const path=`public/uploads/banner/${banner?.bannerPhoto}`

             fs.unlinkSync(path)

             banner.bannerPhoto=filename;
          
        }

        banner.link=link;
        await banner.save()

        res.json({message:"banner edit",banner,status:true})
        return

       
        

    }catch(error){
        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const deleteBanner = async (req:Request, res:Response) => {
    
    try{
        const {banner_id}=req.body;

        let banner = await Banner.findById(banner_id)

        if (!banner) {
            res.json({message: 'Banner not found.',status:false })
            return
        }
        if(banner.isDeleted==null){

            banner.isDeleted = Date.now()
            await banner.save()
            res.json({banner,status:false,message:"Banner Removed"})
            return;
    

        }
        banner.isDeleted = null
        await banner.save()
       

        res.json({banner,status:true,message:"Banner Actived"})
        return;


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
    
}

export const getBanners = async (req:Request, res:Response) => {


    try{
        

        const page =  Number(req.query.page)-1
        const status=req.query.status
        const perPage =  10;

        let query={
           
        } as {}

        if(status=='active'){
            query={
                isDeleted:null
            }
        }
        if(status=='remove'){
            query={
                isDeleted:{$ne:null}
            }
        }


       

     let banners = await Banner.find(query)
        .skip(perPage * page )
        .limit(perPage)
        .lean()

     const totalCount = banners.length
     const pagination=Math.ceil(totalCount/perPage)
   
  
    res.json({ banners, totalCount,pagination,status:true })
    return


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
    
}

export const getDeletedBanners = async (req:Request, res:Response) => {


    try{
        

        const page =  Number(req.query.page)-1
        const perPage =  10;
        const totalCount = await Banner.countDocuments({ isDeleted:{$ne:null}})
        const pagination=Math.ceil(totalCount/perPage)
        

    let banners = await Banner.find({ isDeleted:{$ne:null}})
        .skip(perPage * page )
        .limit(perPage)
        .lean()
    // if (!banners.length) {
    //     return res.status(404).json({ error: 'Banners not available.' })
    // }
  
    res.json({ banners, totalCount,pagination,status:true })
    return


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
    
}


export const addLead =async(req:Request,res:Response)=>{

    try{

        const {email}=req.body;

        let lead = await Lead.findOne({email:email})

        if (lead) {
            res.json({message:'Lead has already been created.',status:false})
            return;
        }

        let newLead = new Lead({email:req.body.email})
        await newLead.save()

        res.json({newLead,status:true})
        return;


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

type MyQueryadmin={
    status:string,
    page:string,
    keyword:string,
}
export const getAdmins=async(req:Request<{},{},{},MyQueryadmin>,res:Response)=>{


    try{

       
       

        const status=req.query.status;

        let query={
            _id:{$ne:req?.admin?._id}
           
            
          
         } as {}
         const totalCount = await Admin.countDocuments(query)

         const page=Number(req.query.page)-1

         const perPage=10

         const pagination=Math.ceil(totalCount/perPage)

         

        if(req.query.keyword) query={
            ...query,
            name:{$regex:req.query.keyword,$option:"i"}
        }

        if(status && status=="verified"){
            query={
                ...query,
                isVerified:{$ne:null}
            }
        }

        if(status && status=="blocked"){
            query={
                ...query,
                isBlocked:{$ne:null}
            }
        }

        const admins =await Admin.find(query)
        .select("-password -salt -resetPasswordLink -emailVerifyLink")
        .limit(perPage)
        .skip(perPage*page)


        res.json({admins,totalCount,pagination,status:true})
        return;
        
        


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}


export  const getSingleAdmin=async(req:Request,res:Response)=>{

    try{

        const {adminId}=req.params;

        const isAdmin=await Admin.findOne({_id:adminId})
        .populate("businessInfo")
        .populate("adminBank")
        .populate("adminWareHouse")


        if(!isAdmin){

            res.json({message:"admin not found",status:false})
            return
        }

        res.json({isAdmin,status:true})
        return


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}


export const getAllDispatchers=async(req:Request,res:Response)=>{


    try{

        

        const page=Number(req.query.page)-1

        const totalCount = await Dispatch.countDocuments()

        const perPage=10

        const pagination=Math.ceil(totalCount/perPage)

        const dispatchers=await Dispatch.find({})
        .select("-password -salt -resetPasswordLink ")
         .limit(perPage)
         .skip(perPage*page)
         .lean()

         res.json({dispatchers,pagination,status:true})
         return;
       


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const addDispatcher=async(req:Request,res:Response)=>{

    try{

        const {email}=req.body

      const {success,error}=  dispatcherValidate.safeParse(req.body);

      if(!success){

        res.json({message:error?.errors[0].message})
        return

       }

       const isDispatch=await Dispatch.findOne({email})

       if(!isDispatch){

          res.json({message:"Email is taken",status:false})
          return;
       }
       
     const hashPassword=  bcrypt.hashSync(req.body.password,10)

       

      const newDispatch= await Dispatch.create({
        password:hashPassword,
        ...req.body
       })

       res.json({message:"created dispatch",status:true,newDispatch});
       return;


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const editeDispatch=async(req:Request,res:Response)=>{


    try{

        const {dispatch_id}=req.body;

        const {oldPassword,newPassword}=req.body;

        let isDispatch=await Dispatch.findById(dispatch_id);

        if(!isDispatch){

            res.json({message:"dispatch not found",status:false});
            return;
        }

        if(oldPassword && newPassword){

          const dispatch=await  Dispatch.findOne({email:isDispatch.email,password:oldPassword})

          if(!dispatch){

            res.json({message:"wrong password",status:false})
            return
          }
         
        }

        const hashPassword=bcrypt.hashSync(newPassword ,10)

        await Dispatch.findByIdAndUpdate(isDispatch._id,{
            password:hashPassword,
            ...req.body
        })


        res.json({message:"dispatch edit",status:true})
        return;


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const blockUnbolckDispatcher=async(req:Request,res:Response)=>{


    try{

        const {dispatch_id}=req.params

      let dispatche=  await Dispatch.findById(dispatch_id)
        .select("-password -resetPasswordLink")

    
        if (!dispatche) {

         res.json({ message: 'Dispatcher not found.' ,status:false})
         return
        }

        if (dispatche.isBlocked) {
            dispatche.isBlocked = null
            await dispatche.save()
             res.json({dispatche,message:"unblock dispatche",status:true})
             return
        }

        dispatche.isBlocked = Date.now()
        await dispatche.save()
        res.json({dispatche,message:"blocked dispatche",status:true})



    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }


}


export const flipAdminBusinessApproval=async(req:Request,res:Response)=>{


    try{
        const {b_id}=req.params;


        let businessInfo = await Businessinfo.findById(b_id);

        if (!businessInfo) {
            res.json({message: "No business information available" ,status:false})

            return;
        }

        if(businessInfo.isVerified){

            let admin=await Admin.findById(businessInfo?.admin)

            if(!admin){

                res.json({message:"admin not found",status:false})
                return
            }

            businessInfo.isVerified=null
            admin.isVerified=null
            
            await businessInfo.save()
            await admin.save()

            res.json({businessInfo,status:false ,message:"business un-Approved"})
            return
        }

        businessInfo.isVerified=Date.now();
        await businessInfo.save()

        res.json({businessInfo,status:true,message:"business approved"})
        return;






    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}


export const flipAdminBankApprovel=async(req:Request,res:Response)=>{


    try{

        const {bank_id}=req.params;

        let bankInfo = await AdminBank.findById(bank_id);

        if(!bankInfo){
            res.json({message:"No bank information available",status:false})
            return
        }

        if(bankInfo.isVerified){

            let admin=await Admin.findById(bankInfo?.admin)

            if(!admin){

                res.json({message:"admin not found",status:false})
                return
            }

            bankInfo.isVerified=null
            admin.isVerified=null
            
            await  bankInfo.save()
            await admin.save()

            res.json({ bankInfo,status:false, message:"bank information un-Approved"})
            return
        }

        bankInfo.isVerified=Date.now();
        await  bankInfo.save()

        res.json({ bankInfo,status:true,message:"bank information approved"})
        return;




    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

export const flipAdminWareHouseApprovel=async(req:Request,res:Response)=>{


    try{

        const {w_id}=req.params;

        let wareHouseInfo = await AdminWareHouse.findById(w_id);

        if(!wareHouseInfo){
            res.json({message:"No wareHouseInfo information available",status:false})
            return
        }

        if(wareHouseInfo.isVerified){

            let admin=await Admin.findById(wareHouseInfo?.admin)

            if(!admin){

                res.json({message:"admin not found",status:false})
                return
            }

            wareHouseInfo.isVerified=null
            admin.isVerified=null
            
            await  wareHouseInfo.save()
            await admin.save()

            res.json({ wareHouseInfo,status:false, message:"wareHouseInfo information un-Approved"})
            return
        }

        wareHouseInfo.isVerified=Date.now();
        await  wareHouseInfo.save()

        res.json({ wareHouseInfo,status:true,message:"wareHouseInfo information approved"})
        return;




    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}

// admin account verification

export const  flipAdminAccountApproval=async(req:Request,res:Response)=>{


    try{

      
        const {email}=req.body
        
      
        

        let adminAccount = await Admin.findOne({email})
        
        .populate("businessInfo")
        .populate("adminBank")
        .populate("adminWareHouse")
        .select('-password -salt -resetPasswordLink -emailVerifyLink')


       
        


        if(!adminAccount){

            res.json({message:"Account has not been created",status:false})
            return
        }

        if(adminAccount.emailVerifyLink){

            res.json({message:"admin email has not been verified.",status:false})
            return
        }

        if(adminAccount.isBlocked){
            res.json({message:"admin account is blocked.",status:false})
            return

        }

        if(!adminAccount.businessInfo.isVerified){
            res.json({message:"Admin business information has not been verified",status:false})
            return
        }
        if(!adminAccount.adminBank.isVerified){
            res.json({message:"Admin bank information has not been verified",status:false})
            return
        }
        if(!adminAccount.adminWareHouse.isVerified){
            res.json({message:"Admin warehouse information has not been verified",status:false})
            return
        }

        if(adminAccount.isVerified){

            adminAccount.isVerified=null

            await adminAccount.save();

            res.json({adminAccount,status:false,message:"admin account un-Approved"})
            return
        }

        adminAccount.isVerified=Date.now()

        await adminAccount.save();

        res.json({adminAccount,status:true,message:"admin account approved"})
        return


    }catch(error){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }
    }
}


export const blockUnblockAdminAccount =async(req:Request,res:Response)=>{


    try{

        
        const {email}=req.body
        

        let admin = await Admin.findOne({email})
        
        .select('-password -salt -resetPasswordLink -emailVerifyLink')

        if (!admin) {

          res.json({ message: "Admin not found" })
          return
        }

        if (admin.isBlocked) {
            admin.isBlocked = null
            await admin.save()
           res.json({admin,status:true,message:"admin Account unblocked"})
           return
        }

        let products = await Product.find({soldBy:admin._id})
        admin.isBlocked = Date.now()
        admin.isVerified = null
        await admin.save()

        products = products.map(async p=>{
            p.isVerified = null
            return await p.save()
            
        })

        await Promise.all(products)

        res.json({admin,message:'admin account bloacked',status:false})
        return




    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const blockUnblockUser = async (req:Request, res:Response) => {


    try{
         
        const {user_id}=req.params

        let user = await User.findById(user_id)
        .select('-password -salt -resetPasswordLink -emailVerifyLink')

        if (!user) {

         res.json({ message: "User not found" ,status:false})
         return
        }

       if (user.isBlocked) {
         user.isBlocked = null
         await user.save()
         res.json({user,message:"user account unblocked",status:true})
         return
        }
 
     user.isBlocked = Date.now()
     await user.save()

     res.json({user,message:"user account blocked",status:false})
     return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
    
}

export const getUser=async(req:Request,res:Response)=>{


    try{

        const page=Number(req.query.page)-1

        let status=req.query.status

        let query={}
        const prepage = 10

        const totalCount=await  User.countDocuments()

        const pagenation=Math.ceil(totalCount/prepage)


        if(status && status=="unblocked") query={
            isBlocked:null
        }

        if(status && status=="blocked") query={
            isBlocked:{$ne:null}
        }

        let users=await User.find(query)
           .limit(prepage)
           .skip(prepage*page)
           .lean()


           res.json({users,status:true,pagenation, totalCount})
           return

        



    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const category=async(req:Request,res:Response)=>{


    try{

        const {
            brands,
            parent_id,
            displayName,
            systemName,
            category_id
        }=req.body

       
        const category= await Category.findOne({displayName});
         
         const filePath=`/public/uploads/category/${req.file?.filename}`


       
        if(category_id){
           

               let updateCategory =await Category.findOne({_id:category_id})

               if(!category){
                
                 res.json({message:"category not Found",status:false})
                 await removeImageFile(filePath)
                 return
                }
               

                if(!updateCategory){
                    await removeImageFile(filePath)

                   res.json({message:'category not found',status:false})
                   return

                }

                
               

                if(req.file?.filename){

                    //delete the old image if it exists
                    const updateFilPath=`public/uploads/category/${updateCategory?.image}`
                     updateCategory.image=req?.file?.filename
                    await removeImageFile(updateFilPath)
                   
                   
                }


     
                updateCategory.displayName=displayName,
                updateCategory.parent=parent_id,
                updateCategory.systemName= systemName,
               

                await updateCategory.save()
     
                res.json({updateCategory,message:"category updated",status:true})
                return
             

        }

        if(req?.file==undefined ||!req.file){

            res.json({message:"image required",status:false})
            return
        }

         if(category){
                
            res.json({message:"category already exist",status:false})
            return
           }

       
        const createNewCategory= await Category.create({
            displayName:displayName,
            parent:parent_id,
            systemName,
            image:req?.file?.filename,
            brands

        })

        res.json({message:'created new Category',createNewCategory,status:true})
        return

        

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const getCategory= async(req:Request,res:Response)=>{


    try{

        const {page,status}=req.query
        const limit=10
        const skipPage=limit*Number(page)-1

        let query={
            isDisabled:null
        } as {}
        if(status=='active'){
            query={
                isDisabled:null
               }
    
           

        }
        if(status=='disabled'){
           query={
            isDisabled:{$ne:null}
           }

        }

       

        let categories=await Category.find(query)
        .limit(limit)
        .skip(skipPage)
        .sort({createdAt:1});

        const totalCategory=categories.length
        const pagination=Math.ceil((totalCategory/limit))


        res.json({categories,status:true,totalCategory,pagination})
        return;


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const getSingleCategory=async(req:Request,res:Response)=>{

    try{

        const {categoryId}=req.params

        const isCategory=await Category.findOne({_id:categoryId, isDisabled:null})

        if(!isCategory){
            res.json({message:'category not found',status:false})
            return
        }

        res.json({isCategory,status:true})
        return

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const flipCategoryAvailablity=async(req:Request,res:Response)=>{


    try{

        const {category_id}=req.body

        let category =await Category.findOne({_id:category_id});

        if(!category){

            res.json({message:"category not found",status:false})
            return
        }


        if(category.isDisabled){
            category.isDisabled = null
            await category.save()
            res.json({category,message:"category unDisabled" ,status:true})
            return

        }

        category.isDisabled = Date.now()
        await category.save()

        res.json({category,message:"Category disabled",status:true})
        return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}

export const toggleProductFeatured = async (req:Request, res:Response) => {

    try{
        const {product_id}=req.body

        let product = await Product.findOne({ _id:product_id, isVerified:{$ne:null}, isDeleted:null, isRejected:null })
        if(!product){
            res.json({ message: "Product not found." ,status:false});
            return;


        }
        
          

        product.isFeatured = product.isFeatured ? null : Date.now()
        product = await product.save()
        res.json({ product })
        return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
    
}

export const approveProduct =async(req:Request,res:Response)=>{


    try{

        const {product_id}=req.params

        const product=await Product.findOne({_id:product_id})
        .populate({
            path:"remark",
            model:"Remark",
            match:{
                isDeleted:null

            }

        })

        if(!product){
            res.json({message:"product not found",status:false})
            return;
        }

       
        let categories = await Category.find({ _id: product.category })//may b array of category as well

        if (!categories.length) {

          res.json({message: "Categories not found of this product." ,status:false})


          return
        }

         // if product has new brand 
        const addBrandToCategory = async(brand:string, categorie:CategoriesProps[])=>{
         
            categorie.forEach((cat)=>{
            if(!cat.brands.includes(brand)){

               cat.brands.push(brand)
              
            }
            
          })



        }

          //add tags to suggestKeywords 
        const addKeywords = async (tags:string[] )=> {
            let keywords = await SuggestKeyword.find().select('-_id keyword')
            keywords = keywords.map(key => key.keyword)
          
            let Keywords = tags.map(async tag => {
                if(!keywords.includes(tag)) {
                    let newKeyWord = new SuggestKeyword({keyword:tag})
                    await newKeyWord.save()
                }
                return tag
            })
            await Promise.all(Keywords)
        }


        //add districts to Districts
        const addDistricts = async (districts:string[]) => {
         let _districts = await District.find().select('-_id name')
         _districts = _districts.map(key => key.name)
       
         let __districts = districts.map(async district => {
            if (!_districts.includes(district)) {
                let newDistrict = new District({ name: district })
                await newDistrict.save()
            }
            return district
         })
         await Promise.all(__districts)
        }



      if(!product.remark.length) {
          
        product.isVerified = Date.now()
        product.isRejected = null
            addBrandToCategory(product.brand, categories)
            addKeywords(product.tags)
            addDistricts(product.availableDistricts)

           await product.save()

           res.json({product,status:true,message:"product approved"})
           return
         
        }

         const remark = await Remark.findById(product.remark[0])
         const updateRemark = remark.toObject()
         updateRemark.isDeleted = Date.now()

            const updateProduct = product.toObject()
           updateProduct.isVerified = Date.now()
           updateProduct.isRejected = null
            addBrandToCategory(updateProduct.brand, categories)
            addKeywords(product.tags)
            addDistricts(product.availableDistricts)

           await updateProduct.save()

           res.json({updateProduct,status:true,message:"product approved"})
           return


      

     


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}

export const disApproveProduct=async(req:Request,res:Response)=>{


    try{

        const {product_id}=req.params
        const {comment}=req.body;

        const product = await Product.findOne({ _id:product_id })

        if (!product) {
            res.json({ message: "Product not found",status:false })
            return
        }

        const newRemark = new Remark({
            comment
        })

      
        product.isVerified = null,
        product.isRejected = Date.now()
        product.isDeleted = null
        product.isFeatured = null
        product.remark.push(newRemark._id)
        
       await product.save()

       res.json({product,message:"unVerified product",status:true})
       return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}

type  MyQuery={
     createdAt:string,
     updatedAt:string,
     price:string ,
     status:string,
     keyword:string,
     outofstock:string,
    page:string

}
export const getProduct=async(req:Request<{},{},{},MyQuery>,res:Response)=>{

    try{

        const page=Number(req.query.page)-1

        const perpage=10

        const { createdAt, updatedAt, price ,status, keyword, outofstock} = req.query
           
        let query={}

      

      

        let sortFactor = { };

        if (createdAt && (createdAt === '-1' || createdAt === '1')) sortFactor = { createdAt:createdAt=='1'?"asc":"desc" }
        if (updatedAt && (updatedAt === 'asc' || updatedAt === 'desc')) sortFactor = { updatedAt }
        if (price && (price === '-1' || price === '1')) sortFactor = { price: price == "1" ? 1 : -1 } as {price:number}


        
        if (keyword) query = {
            ...query,
            name: { $regex: keyword, $options: "i" }
        }
        if (status && status === 'verified') query = {
            ...query,
            isVerified: { $ne: null }
        }
        if (status && status === 'rejected') query = {
            ...query,
            isRejected: { $ne: null }
        }
        if (status && status === 'featured') query = {
            ...query,
            isFeatured: { $ne: null }
        }
        if (status && status === 'unverified') query = {
            ...query,
            isVerified: null
        }
        if (status && status === 'deleted') query = {
            ...query,
            isDeleted: { $ne: null }
        }
        if (status && status === 'notdeleted') query = {
            ...query,
            isDeleted: null
        }
        if (outofstock && outofstock === 'yes') query = {
            ...query,
            quantity: 0
        }

        let products = await Product.find(query)
        .populate("category", "displayName slug")
        .populate("brand", "brandName slug")
        .populate("soldBy", "name _id shopName")
        .populate("images", "-createdAt -updatedAt -__v")
        .skip(perpage * page)
        .limit(perpage)
        .lean()
        .sort(sortFactor)
        
        let totalCount=products.length
        const pagination=Math.ceil(totalCount/perpage)
        res.json({products,pagination,totalCount,status:true})
        return
    

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const productBrandItems=async(req:Request,res:Response)=>{

    try{
        const { brandName, brand_id,systemName } = req.body

        if (brand_id) {
            let updateBrand = await ProductBrand.findById(brand_id)

            if (!updateBrand) {
                 res.json({ message: "Product brand not found." ,status:false})
                 return
            }
            // then update
            updateBrand.brandName = brandName
            await updateBrand.save()
            res.json({updateBrand,message:"update product brand",status:true})
            return
        }

     let newBrand = await ProductBrand.findOne({ brandName })

     if (newBrand) {
        res.json({ message: "Product brand already exist",status:false })
        return
     }

     newBrand = new ProductBrand({ systemName, brandName })
     await newBrand.save()
     res.json({newBrand,message:"new ProductBrand created",status:true})

     return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}


export const getProductBrands=async(req:Request,res:Response)=>{

    try{
        let productbrands = await ProductBrand.find()
   
      res.json({productbrands,status:true})
      return


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error.message,status:false})
            return
        }

    }
}