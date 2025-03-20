import { NextFunction, Request, Response } from "express";
import { Order } from "../models/Orderschema";
import { Admin } from "../models/adminschema";
import { Address } from "../models/addressSchema";
import { Product } from "../models/Product";
import { CartProps, ProductProps } from "../types/types";
import { Cart } from "../models/Cart";
import {Payment} from "../models/payment";
import { Remark } from "../models/Remark";
import { allOrderStatus } from "../middleware/common";
import dotenv from "dotenv"
import Razorpay from "razorpay";
import crypto from 'crypto'



dotenv.config()


const instance= new Razorpay({
  key_id:process.env.RAZORPAY_KEY_ID,
  key_secret:process.env.RAZORPAY_KEY_SECRET,
})


export  const order =async(req:Request,res:Response,next:NextFunction)=>{


    try{
    
        
       

        console.log(req.params.order_id,300)


        
        const order =await Order.findOne({_id:req.params.order_id})

       
        .populate("user", "-password -salt -resetPasswordLink -emailVerifyLink")
        .populate("payment", "-user -order")
        .populate({
          path:"product",
          select:"category",
          populate: {
            path:"category",
            model:"Category",
          },
        })
      .populate({
        path: "product",
        select: "name slug images price discountRate _id category brand return isVerified isDeleted warranty quantity",
        populate: {
          path: "images",
          model: "ProductImages",
        },
        
      })
        .populate({
          path: "soldBy",
          select:"name shopName address isVerified isBlocked holidayMode photo email",
          populate: {
            path: "adminWareHouse",
            model: "AdminWareHouse",
          },
        })
        .populate({
          path: "status.cancelledDetail.remark",
          model: "Remark",
          match:{
            isDeleted:null
          }
        })
        //not working..
        // .populate({
        //     path: 'status.cancelledDetail.cancelledBy',
        //     model: 'admin',
        //     select: 'name email phoneno'
        // })
        .populate({
          path: "status.cancelledDetail.cancelledByUser",
          model: "User",
          select: "name email  role",
        })
        .populate({
          path: "status.cancelledDetail.cancelledByAdmin",
          model: "Admin",
          select: "name email  role",
        })
        .populate({
          path: "status.dispatchedDetail.dispatchedBy",
          model: "Dispatch",
          select: "name email address phone",
        })
        .populate({
          path: "status.returnedDetail.returneddBy",
          model: "Dispatch",
          select: "name email address phone",
        })
        .populate({
          path: "status.returnedDetail.remark",
          model: "Remark",
          match: {
            isDeleted: null
          }
        });

      if (!order) {

        res.json({message: "Order not found",order,status:false });
        return
      }
      req.order = order;

      next();


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }


}

export const singleOrder=(req:Request,res:Response)=>{

  try{

    res.json({order:req?.order,status:true})
    return

  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }
}


export const userOrder=async(req:Request,res:Response)=>{


    try{

        let order = req.order;

        if (order.user._id.toString() !== req.authUser?._id.toString()) {

         res.json({message: "Unauthorized User.",status:false });
         return
        }
      
        res.json({order,status:true});
        return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }

}

export const adminOrder=async(req:Request,res:Response)=>{

    try{

        let order = req.order;
       if (order.soldBy._id.toString() !== req.admin._id.toString()) {

          res.json({message: "Unauthorized Admin." ,status:false});
          return
        }
        

          res.json({order , status:true});
          return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }
}

export const dispatcherOrder=async(req:Request,res:Response)=>{

    try{

         let order = req.order;
         
          res.json({order , status:true});
          return


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }
}

export const calculateShippingCharge=async(req:Request,res:Response)=>{

    try{

        const superadmin = await Admin.findOne({ role: "superadmin" });

            if (!superadmin) {

             res.json({message: "Cannot find shipping rate",status:false });
             return;
            }
             const shippingAddress = await Address.findOne({

            user: req.authUser?._id,
            isActive: { $ne: null },

           });
 
            if (!shippingAddress) {

               res.json({message: "Cannot found shipping address of the user." ,status:false});
               return
            }


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }
}


// online payment

export const createOrderForOnlinePayment=async(req:Request,res:Response)=>{

 
  

  try{

    const {addressId,shippingCharge,method,productId} = req.body;
          console.log(req.body)

        //vaidate address
         const isAddress=await Address.findOne({_id:addressId})
         if(!isAddress){

          res.json({message:"Shipping Address Not found", status:false})
          return
         }

        
        
        let isCart=await  Cart.find({user:req.authUser?._id ,isDeleted:null})
           .populate("user")
           .populate("user")  
          

        if(productId){
           isCart=await  Cart.find({user:req.authUser?._id,product:productId ,isDeleted:null})
           .populate("user")  
          

        }

        
        

        if(!isCart){

            res.json({message:"cart not found",status:false})
            return
        }

        const productsId=isCart.map((p)=>p.product._id.toString())

        

         
        let products= await Product.find({_id:{$in:productsId}, isVerified:{$ne:null},isDeleted:null})

          .populate("soldBy")
         
          
          if(products.length!==isCart.length){

            res.json({message:"product not found c",status:true})
            return
          }
         

          // if(isCart.find((q)=>q.quantity==undefined || q.quantity <1)){

          //   res.json({message:"product quantity is required",status:true})
          //   return

          // }

          let error

          for(let i=0; i<isCart.length ; i++){
 
             const product =products[i]
 
             if (product.soldBy.isBlocked || !product.soldBy.isVerified) {
                 error = `Seller not available of product ${product.name}`
                 break;
             }
 
             
            if (product.quantity < isCart.find(p=> p.product._id === product?._id) && isCart.find(p=> p.quantity).quantity) {
                 error = `There are only ${product.quantity} quantity of product ${product.name} available.`
                 break;
             }
          }
 
 
          
 
          if(error){
 
             res.json({message:error,status:false})
             return
          }

          /// order total amount add product price , discount and shipping charge

         
           
          

          const subTotal=isCart.reduce((acc,item)=>{
            const discount=item?.product?.quantity
            const productPrice=item?.product?.price

            const qunatity=item?.quantity

            const productDiscount=productPrice*(1-discount/100)
           

            return acc+productDiscount*(qunatity?qunatity:1)

          },0)

          let totalAmount=subTotal+(shippingCharge?shippingCharge:0)

          //orderOption
          const orderOption={
            totalAmount,
            paymentMethod:method,
            addressId,
            shippingCharge,
            user:isAddress
          }

          //option
          const options={
            amount:100,
            currency:"INR"

          }

          const order=await instance.orders.create(options)

          res.json({order,orderOption,status:true})
          return



   


  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }

}

//payment verification

export  const paymentVerification=async(req:Request,res:Response)=>{

  try{
    const { order_id, payment_id, signature,orderOption,productId } = req.body;

    const { 
      addressId,
      paymentMethod,
      totalAmount  ,
      shippingCharge
    }=orderOption

   

    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${order_id}|${payment_id}`)
    .digest('hex')

    if(expectedSignature===signature){

        const isAddress=await Address.findOne({_id:addressId})
         if(!isAddress){

          res.json({message:"Shipping Address Not found", status:false})
          return
         }

        //  const isCart=await Cart.find({user:req.authUser?._id ,isDeleted:null})
        //  .populate("user")
        //  .populate('product')
           
         let isCart=await  Cart.find({user:req.authUser?._id ,isDeleted:null})
           .populate("user")  
           .populate('product')
          

          if(productId){
            isCart=await  Cart.find({user:req.authUser?._id,product:productId ,isDeleted:null})
            .populate("user") 
            .populate('product') 
          

          }
         
         
 
         if(!isCart){
 
             res.json({message:"cart not found",status:false})
             return
         }

         
        const productsId=isCart.map((p)=>p.product._id.toString())

        

         
        let products= await Product.find({_id:{$in:productsId}, isVerified:{$ne:null},isDeleted:null})

          .populate("soldBy")
 


        let allItems=isCart.map(async(c)=>{


        

          let thisProduct = products.find((p)=>p?._id)._id.toString()===c?.product?._id.toString() 
           && products.find((p)=>p?._id)


           

         

          let newOrder= new Order()


          newOrder.user=req.authUser?._id;
          newOrder.product=thisProduct?._id;
          newOrder.soldBy=thisProduct?.soldBy?._id;
          newOrder.quantity=c?.quantity;
          newOrder.isPaid=true

          newOrder.shipto={
           
            city: isAddress.city,
            area: isAddress.area,
            address:isAddress.address,
            phoneno:isAddress.phone,
          };

          // if (shipto.lat && shipto.long) {
          //    let geolocation = {
          //     type: "Point",
          //     coordinates: [shipto.long, shipto.lat],
          //    };

          //    newOrder.shipto.geolocation = geolocation;
          // }

          const status = {
            currentStatus: "active",
            activeDate: Date.now(),
          };

          newOrder.status = status;

           

           // new payment
           let newPayment = new Payment({
            user: req.authUser?._id,
            order: newOrder?._id,
            method: paymentMethod,
            shippingCharge: shippingCharge,
            transactionCode: newOrder._id,
            amount: Math.round(totalAmount),
           from: req?.authUser?.phone,//esewa type
           });


           newOrder.payment=newPayment?._id

           await newOrder.save()
           await newPayment.save()


           //if product is in cart remove from it
           let cart = await Cart.findOne({ product:thisProduct?._id, user: req.authUser?._id, isDeleted: null })

             if (cart) {
            
              cart.isDeleted = Date.now()
              
              await cart.save()
      
            }

            return newOrder


        })

        await Promise.all(allItems)

        console.log(allItems,500)

        res.json({status:true})
         return
    }else{

      res.json({status:false})
      return
    }

  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }
}

export const createOrder=async(req:Request,res:Response)=>{

    try{
        const {addressId,shippingCharge,method,productId} = req.body;

        //vaidate address
         const isAddress=await Address.findOne({_id:addressId})
         if(!isAddress){

          res.json({message:"Shipping Address Not found", status:false})
         }

          let isCart=await  Cart.find({user:req.authUser?._id ,isDeleted:null})
           .populate("user")  
          

          if(productId){
           isCart=await  Cart.find({user:req.authUser?._id,product:productId ,isDeleted:null})
           .populate("user")  
          

          }

        
        

        if(!isCart){

            res.json({message:"cart not found",status:false})
            return
        }

        //validate products

        const productsId=isCart.map((p)=>p.product.toString())

        

         
        let products= await Product.find({_id:{$in:productsId}, isVerified:{$ne:null},isDeleted:null})

          .populate("soldBy")
         
          
          if(products.length!==isCart.length){

            res.json({message:"product not found c",status:true})
            return
          }

          if(isCart.find((q)=>q.quantity==undefined || q.quantity <1)){

            res.json({message:"product quantity is required",status:true})
            return

          }

        
          let error

         const isAdminOnHoliday = (first:number, last:number) => {

           let week = [0, 1, 2, 3, 4, 5, 6];

           let firstIndex = week.indexOf(first);

           week = week.concat(week.splice(0, firstIndex)); //Shift array so that first day is index 0

           let lastIndex = week.indexOf(last); //Find last day

           //Cut from first day to last day nd check with today day
           return week.slice(0, lastIndex + 1).some((d) => d === new Date().getDay());
         };


          for(let i=0; i<isCart.length ; i++){

            const product =products[i]

            if (product.soldBy.isBlocked || !product.soldBy.isVerified) {
                error = `Seller not available of product ${product.name}`
                break;
            }

           if (
                isAdminOnHoliday(
                  product.soldBy.holidayMode.start,
                  product.soldBy.holidayMode.end
                )
            ) {
                error = `Seller is on holiday of product ${product.name}. Please order manually ` 
                break;
             }
            

            
           if (product.quantity < isCart.find(p=> p.product === product?._id) && isCart.find(p=> p.quantity).quantity) {
                error = `There are only ${product.quantity} quantity of product ${product.name} available.`
                break;
            }
         }


         

         if(error){

            res.json({message:error,status:false})
            return
         }

         //create orders

       let allItems=isCart.map(async(c)=>{

        

          let thisProduct = products.find((p)=>p?._id)._id.toString()===c?.product.toString() 
           && products.find((p)=>p?._id)

         

          let newOrder= new Order()


          newOrder.user=req.authUser?._id;
          newOrder.product=thisProduct?._id;
          newOrder.soldBy=thisProduct?.soldBy?._id;
          newOrder.quantity=c?.quantity;
          newOrder.isPaid=false

          newOrder.shipto={
           
            city: isAddress.city,
            area: isAddress.area,
            address:isAddress.address,
            phoneno:isAddress.phone,
          };

          // if (shipto.lat && shipto.long) {
          //    let geolocation = {
          //     type: "Point",
          //     coordinates: [shipto.long, shipto.lat],
          //    };

          //    newOrder.shipto.geolocation = geolocation;
          // }

          const status = {
            currentStatus: "active",
            activeDate: Date.now(),
          };

           newOrder.status = status;
          // const subTotal=isCart.reduce((acc,item)=>{
          //   const discount=item?.product?.quantity
          //   const productPrice=item?.product?.price

          //   const qunatity=item?.quantity

          //   const productDiscount=productPrice*(1-discount/100)
           

          //   return acc+productDiscount*(qunatity?qunatity:1)

          // },0)

          // let totalAmount=subTotal+(shippingCharge?shippingCharge:0)

            let discountRate=(Number(thisProduct?.price)) - (Number(thisProduct?.price)) * (+thisProduct?.discountRate / 100)
            let productQuantity=Number(c.quantity)

           // new payment
           let newPayment = new Payment({
            user: req.authUser?._id,
            order: newOrder?._id,
            method: method,
            shippingCharge: shippingCharge,
            transactionCode: newOrder._id,
            amount: Math.round(
            discountRate*productQuantity
             
            ),
           from: req?.authUser?.phone,//esewa type
           });


           newOrder.payment=newPayment?._id

           await newOrder.save()
           await newPayment.save()


           //if product is in cart remove from it
            let cart = await Cart.findOne({ product:thisProduct?._id, user: req.authUser?._id, isDeleted: null })

             if (cart) {
            
              cart.isDeleted = Date.now()
              
              await cart.save()
      
            }

            return newOrder


        })

        allItems= await Promise.all(allItems)


        res.json({status:true,message:"successFully orderd"})
        return

        
        


    }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
    }

}

const search_orders = async (
  page:Number, 
  perPage:Number, 
  keyword = '', 
  query:{}, 
  res:Response, 
  type:string) => {

  let populateUser = {
      path: `${type}`,
      select: type==='user'? 'name': 'shopName'
  }

  
  const skip=Number(perPage)*Number(page)

  let sortFactor = { createdAt: 'desc' } as {}

  let orders = await Order.find(query)

      .populate({
          path: 'product',
          match: {
              name: { $regex: keyword, $options: "i" }
          },
          select: 'name slug images price',
          populate: {
              path: "images",
              model: "ProductImages",
          }
      })
      .populate(populateUser)
      .populate("payment")
      .limit(perPage as number)
      .skip(skip)
      .lean()
     
      .sort(sortFactor)

     orders = orders.filter(o => o.product !== null)

     let totalCount = orders.length
     let pagination =Math.ceil(totalCount/Number(perPage))
 
   res.json({ orders, totalCount,pagination ,status:true});
   return
}


export  const userOrders =async(req:Request,res:Response)=>{


  try{

    const page = Number(req.query.page)-1 ;

    const perPage =10

    let status = req.query.status as string;

    const keyword = req.query.keyword  as string

    let query = {
       user:req.authUser?._id 
      }as {}

     let statusArray =status? status.split(","):[]
     console.log(statusArray)

      query = {
        ...query,
        "status.currentStatus": {$in:statusArray},
        
      };

      if (keyword) return await search_orders(page, perPage, keyword, query, res ,'soldBy')


        let orders = await Order.find(query)

        .populate({
         path: "product",
         select: "name slug images price",
         populate: {
         path: "images",
         model: "ProductImages",
         },
        })
        .populate('payment')
       .populate("soldBy", "shopName")
       .skip(perPage * page )
       .limit(perPage)
       .lean()
       .sort({ createdAt: -1 });
       // if (!orders.length) {
       //     return res.status(404).json({error: "No orders found"})
       // }
       const totalCount = await Order.countDocuments(query);

       let pagination =Math.ceil(totalCount/Number(perPage))

       res.json({ orders, totalCount,pagination,status:true })
       return


  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
  }
}

export  const adminOrders=async(req:Request,res:Response)=>{


  try{

    const page = Number(req.query.page)-1 ;

    const perPage =10

    const status = req.query.status;
     const price=req.query.price
    const keyword = req.query.keyword  as string

      let query = {
        soldBy: req.admin?._id 
      }as {}

    if (
      status &&
      (status === "active" ||
        status === "cancel" ||
        status === "return" ||
        status === "complete" ||
        status === "tobereturned" ||
        status === "approve" ||
        status === "dispatch")
    )
      query = {
        ...query,
        "status.currentStatus": status,
      };

      

      if (keyword) return await search_orders(page, perPage, keyword, query, res ,'user')


        let orders = await Order.find(query)

        .populate({
         path: "product",
         select: "name slug images price discountRate",
         populate: {
         path: "images",
         model: "ProductImages",
         },
        })
       .populate("user")
       .populate("payment")
       .skip(perPage * page )
       .limit(perPage)
       .lean()
       .sort({ createdAt: -1 });
       // if (!orders.length) {
       //     return res.status(404).json({error: "No orders found"})
       // }
       const totalCount = await Order.countDocuments(query);

       let pagination =Math.ceil(totalCount/Number(perPage))

       res.json({ orders, totalCount,pagination,status:true })
       return

  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
  }
}

export const toggleOrderApproval = async (req:Request, res:Response)=>{

  try{

      let order = req.order;

      if (order.soldBy._id.toString() !== req.admin._id.toString()) {

       res.json({message: "Unauthorized Admin" ,status:false});
        return
      }

      if (
        order.status.currentStatus !== "active" &&
        order.status.currentStatus !== "approve"
      ) {
         res.json({
          status:false,
          message: `This order cannot be approve or activate. Order current status is ${order.status.currentStatus}`,
        });

        return
      }

      let product = await Product.findById(order.product)
     
    
      let neworder = await Order.findById(order._id)
     


      if (order.status.currentStatus === "active") {

        neworder.status.currentStatus = "approve";

        neworder.status.approvedDate = Date.now();

        product.quantity = product.quantity-Number(order.quantity)

        if (product.quantity < 1) {

           res.json({message:"Cannot approve!, product is out of stock.",status:true})
           return
        }

        product.noOfSoldOut += order.quantity
        
        
       
       
        neworder.soldBy = order.soldBy._id

        await neworder.save()
        await product.save()

        res.json({message:"order Approved",status:true});
        return
      }

      if (order.status.currentStatus === "approve") {

           neworder.status.currentStatus = "active";

          neworder.status.approvedDate = null;

           product.quantity = product.quantity + order.quantity

          product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity)
        
           neworder.soldBy = order.soldBy._id

          await neworder.save()
          await product.save()

          res.json({message:"order Active",status:true});
          return
      }


  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
  }


}

export  const orderCancelByAdmin=async(req:Request,res:Response)=>{

  try{

    let order = req.order;

    let updateOrder=await Order.findById(order._id)



    if (!req.body.remark) {
       res.json({ message: "Remark is required.",status:false });
       return
    }

    if (order.soldBy._id.toString() !== req.admin._id.toString()) {

        res.json({ message: "Unauthorized Admin" ,status:false});
        return
    }

    if (order.status.currentStatus === "cancel") {
       res.json({ message: "Order has already been cancelled." });
       return
    }

    if (
     order.status.currentStatus !== "active" &&
     order.status.currentStatus !== "approve"
    ) 
    {
       res.json({
       message: `This order is in ${order.status.currentStatus} state, cannot be cancelled.`,
       status:false
      });
      return
    }

    let newRemark =await Remark.create({ 
      comment: req.body.remark 
    });

    
   console.log(req?.admin)

    updateOrder.status.currentStatus = "cancel";

    updateOrder.status.cancelledDetail.cancelledDate = Date.now();

   
    updateOrder.status.cancelledDetail.cancelledByAdmin = req.admin._id

    updateOrder.status.cancelledDetail.remark = newRemark._id


    let product = await Product.findById(order?.product?._id);

   

    product.quantity = order.quantity + product.quantity;

    product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity)

     
    await updateOrder.save();
    await product.save()
    await newRemark.save()

    res.json({message:"order canceled by admin",status:true})
    return

  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
  }
}


export  const orderCancelByUser = async (req:Request, res:Response)=>{

  try{

    let order = req.order;

    let updateOrder=await Order.findById(order._id)

    if (!req.body.remark) {
       res.json({ message: "Remark is required.",status:false });
       return
    }

   

    if (order?.user._id.toString() !== req.authUser?._id.toString()) {

        res.json({ message: "Unauthorized Admin" ,status:false});
        return
    }

    if (order.status.currentStatus === "cancel") {

       res.json({ message: "Order has already been cancelled.",status:false });

       return
    }

    if (
     order.status.currentStatus !== "active" &&
     order.status.currentStatus !== "approve"
    ) 
    {
       res.json({
       message: `This order is in ${order.status.currentStatus} state, cannot be cancelled.`,
       status:false
      });
      return
    }

    let newRemark =await Remark.create({ 
      comment: req.body.remark 
    });
   
    updateOrder.status.currentStatus = "cancel";

    updateOrder.status.cancelledDetail.cancelledDate = Date.now();

    updateOrder.status.cancelledDetail.cancelledByUser = req.authUser._id

    updateOrder.status.cancelledDetail.remark = newRemark._id
    


    let product = await Product.findById(order.product._id);

    

    product.quantity = order.quantity + product.quantity;

    product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity)

     
    await updateOrder.save();
    await product.save()
    await newRemark.save()

    res.json({message:"order canceled user",status:true})
    return

  }catch(error:unknown){

        if(error instanceof Error){

            res.json({message:error.message ,status:false});
            return
        }
  }
}

export  const toggleDispatchOrder = async (req:Request,res:Response)=>{

  try{

    let order = req.order;

    let updateOrder=await Order.findById(order._id)

    console.log(updateOrder,40)

    if (
     order.status.currentStatus !== "approve" &&
     order.status.currentStatus !== "dispatch"
    ) { 
      res.json({
        status:false,
        message: `This order cannot be dispatched or rollback to approve state. Order current status is ${order.status.currentStatus}`,
      })
      return
    }

    if(order.status.currentStatus === "approve") {

        order.status.currentStatus="dispatch";
        await Order.findByIdAndUpdate(order._id,{
          status:{
            currentStatus:"dispatch",
             dispatchedDetail: {
              dispatchedDate: Date.now(),
              dispatchedBy: req.admin._id,
             } 
          }

        })

        // updateOrder.status.dispatchedDetail = {
        //  dispatchedDate: Date.now(),
        //  dispatchedBy: req.admin._id,
        // } 
        // await updateOrder.save();

        res.json({message:"Order Dispatch",status:true})
        return
     }

    if (
     order.status.dispatchedDetail.dispatchedBy._id.toString() !==
      req.admin._id.toString()
    ) {
      res.json({message: `Unauthorized Dispatcher.` ,status:false})
      return
    }

    if (order.status.currentStatus === "dispatch") {

        order.status.currentStatus = "approve"

        updateOrder.status.dispatchedDetail = {
         dispatchedDate: null,
         dispatchedBy: undefined,
       };

      await updateOrder.save();
      res.json({message:"Order Approve",status:true});
      return
  }


  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }

}

export  const dispatcherOrders = async (req:Request,res:Response)=>{


  try{

    const page = Number(req.query.page)-1
    const perPage = 10;
    const status = req.query.status;

    let query = { "status.currentStatus": "approve" };

    if (status && status === "tobereturned")
      query = { "status.currentStatus": status };

    let orders = await Order.find(query)
    .skip(perPage * page )
    .limit(perPage)
    .lean()
    .sort({ createdAt: -1 });
   // if (!orders.length) {
   //     return res.status(404).json({error: "No orders are ready to ship."})
   // }
    const totalCount = await Order.countDocuments(query);

    const pagination =Math.ceil(totalCount/perPage)

    res.json({ orders, totalCount,pagination });
    return


  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }
}


export const toggleCompleteOrder = async (req:Request,res:Response)=>{

  try{

    let order = req.order;

    let updateOrder = await Order.findById(order._id)

    if (
      order.status.currentStatus !== "complete" &&
      order.status.currentStatus !== "dispatch"
    ) {
       res.json({
        status:true,
        message: `This order cannot be completed or rollback to dispatch state. Order current status is ${order.status.currentStatus}`,
       })
      return
    }

    if (order.status.currentStatus === "dispatch") {
       updateOrder.status.currentStatus = "complete";
       updateOrder.status.completedDate = Date.now();
       updateOrder.isPaid = true;
       await updateOrder.save();

       res.json({message:'Order dispatch',status:true})
       return
    }

    if (order.status.currentStatus === "complete") {

        updateOrder.status.currentStatus = "dispatch";

        updateOrder.status.dispatchedDetail.dispatchedDate= Date.now();

        updateOrder.status.completedDate = null;
        order.isPaid = false;
        await updateOrder.save();

        res.json({message:'Order complete',status:true})
        return
    }


  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }

}


export const returnOrder =async(req:Request,res:Response)=>{

  try{

    let order = req.order;
      
    let updateOrder=await Order.findById(order._id)
     
     if (order.status.currentStatus !== "tobereturned") {
         res.json({
          status:false,
          message: `This order cannot be returned. Order current status is ${order.status.currentStatus}`,
        })
       return
     }
   // const newRemark = new Remark({ comment: req.body.remark });

 
   updateOrder.status.currentStatus = "return";

   updateOrder.status.returnedDetail.returnedDate = Date.now();

   // updateOrder.status.returnedDetail.remark = newRemark._id;
   updateOrder.status.returnedDetail.returneddBy = req.dispatch._id;
   // let product = await Product.findById(order.product._id);
   // let updateProduct = product.toObject();

  
   res.json({order,status:true})
   return



  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }
}


export const toggletobeReturnOrder =async(req:Request,res:Response)=>{

  try{

    let order = req.order;
    if (
     order.status.currentStatus !== "complete" &&
     order.status.currentStatus !== "tobereturned"
    ) {
     res.json({
      status:false,
      message: `This order is not ready to return or rollback to complete state. Order current status is ${order.status.currentStatus}`,
    });
    return
  }

  let updateOrder = await Order.findOne({_id:order?._id})

  

  


  let payment = await Payment.findOne({_id:order?.payment});
 
 

  if (order.status.currentStatus === "complete") {

     if (!req.body.remark) {
       res.json({message: "Remark is required.",status:false})
       return
     }

    updateOrder.status.currentStatus = "tobereturned";
    updateOrder.status.tobereturnedDate = Date.now();
    
    let remark = new Remark({
      comment:req.body.remark
    })
    await remark.save()
    updateOrder.status.returnedDetail.remark.push(remark._id)
    payment.returnedAmount= +req.body?.returnedAmount
    

  

    
    updateOrder.soldBy = order.soldBy._id

    await payment.save()
    await updateOrder.save()
     res.json({order,status:true})
     return
  }

  if (order.status.currentStatus === "tobereturned") {

    updateOrder.status.currentStatus = "complete";

    updateOrder.status.tobereturnedDate = null;
    let remark = await Remark.findOne({_id:order.status.returnedDetail.remark[0]})
    
    remark.isDeleted = Date.now()

    payment.returnedAmount = undefined;

    
    updateOrder.soldBy = order.soldBy._id
    await payment.save()
    await updateOrder.save()

     res.json({order,status:true})
    return
  }

  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }
}


export const getOrderStatus = async (req:Request, res:Response)=>{


  try{
    res.json(allOrderStatus)
    return


  }catch(error:unknown){

    if(error instanceof Error){

        res.json({message:error.message ,status:false});
        return
    }
  }
}