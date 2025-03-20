

import express from "express"
import { auth } from "../controller/user_auth"
import { adminOrders, calculateShippingCharge, createOrder, createOrderForOnlinePayment, dispatcherOrder, dispatcherOrders, getOrderStatus, order, orderCancelByAdmin, orderCancelByUser, paymentVerification, returnOrder, singleOrder, toggleCompleteOrder, toggleDispatchOrder, toggleOrderApproval, toggletobeReturnOrder, userOrders } from "../controller/order"
import { dispatchAuth } from "../controller/dispatcher_auth"
import { checkAdminSignin } from "../controller/admin_auth"

export const orderRouter=express.Router()

//user's

orderRouter.post("/shipping-charge",auth,calculateShippingCharge)
orderRouter.post('/create-order',auth,createOrder)
orderRouter.post('/create-order-razorpay',auth,createOrderForOnlinePayment)
orderRouter.post('/order-payment-verification',auth,paymentVerification)

orderRouter.patch('/cancel-order/:order_id',auth,orderCancelByUser)
orderRouter.get("/orders",auth,userOrders)

orderRouter.get("/get-order-status",getOrderStatus)

 orderRouter.param("order_id",order)
 orderRouter.get('/one/:order_id',singleOrder)


 //admin's
 orderRouter.patch('/toggle-order-approval/:order_id',checkAdminSignin,toggleOrderApproval)
 orderRouter.patch("/cancel-order-admin/:order_id",checkAdminSignin,orderCancelByAdmin)
 orderRouter.patch("/toggle-order-to-get-return/:order_id",checkAdminSignin,toggletobeReturnOrder)

 orderRouter.get("/admin-orders",checkAdminSignin,adminOrders)

//dispatcher,s

orderRouter.patch('/toggle-dispatch-order/:order_id',checkAdminSignin,toggleDispatchOrder)
orderRouter.patch('/dispatcher-orders',dispatchAuth,dispatcherOrders)
orderRouter.patch('/toggle-complete-order-request/:order_id',checkAdminSignin,toggleCompleteOrder)
orderRouter.patch('/return-order/:order_id',dispatchAuth,returnOrder)
orderRouter.patch('/dispatcher-oredr/:order_id',dispatchAuth,dispatcherOrder)




orderRouter.param("order_id",order)