"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRouter = void 0;
const express_1 = __importDefault(require("express"));
const user_auth_1 = require("../controller/user_auth");
const order_1 = require("../controller/order");
const dispatcher_auth_1 = require("../controller/dispatcher_auth");
const admin_auth_1 = require("../controller/admin_auth");
exports.orderRouter = express_1.default.Router();
//user's
exports.orderRouter.post("/shipping-charge", user_auth_1.auth, order_1.calculateShippingCharge);
exports.orderRouter.post('/create-order', user_auth_1.auth, order_1.createOrder);
exports.orderRouter.post('/create-order-razorpay', user_auth_1.auth, order_1.createOrderForOnlinePayment);
exports.orderRouter.post('/order-payment-verification', user_auth_1.auth, order_1.paymentVerification);
exports.orderRouter.patch('/cancel-order/:order_id', user_auth_1.auth, order_1.orderCancelByUser);
exports.orderRouter.get("/orders", user_auth_1.auth, order_1.userOrders);
exports.orderRouter.get("/get-order-status", order_1.getOrderStatus);
exports.orderRouter.param("order_id", order_1.order);
exports.orderRouter.get('/one/:order_id', order_1.singleOrder);
//admin's
exports.orderRouter.patch('/toggle-order-approval/:order_id', admin_auth_1.checkAdminSignin, order_1.toggleOrderApproval);
exports.orderRouter.patch("/cancel-order-admin/:order_id", admin_auth_1.checkAdminSignin, order_1.orderCancelByAdmin);
exports.orderRouter.patch("/toggle-order-to-get-return/:order_id", admin_auth_1.checkAdminSignin, order_1.toggletobeReturnOrder);
exports.orderRouter.get("/admin-orders", admin_auth_1.checkAdminSignin, order_1.adminOrders);
//dispatcher,s
exports.orderRouter.patch('/toggle-dispatch-order/:order_id', admin_auth_1.checkAdminSignin, order_1.toggleDispatchOrder);
exports.orderRouter.patch('/dispatcher-orders', dispatcher_auth_1.dispatchAuth, order_1.dispatcherOrders);
exports.orderRouter.patch('/toggle-complete-order-request/:order_id', admin_auth_1.checkAdminSignin, order_1.toggleCompleteOrder);
exports.orderRouter.patch('/return-order/:order_id', dispatcher_auth_1.dispatchAuth, order_1.returnOrder);
exports.orderRouter.patch('/dispatcher-oredr/:order_id', dispatcher_auth_1.dispatchAuth, order_1.dispatcherOrder);
exports.orderRouter.param("order_id", order_1.order);
