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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderStatus = exports.toggletobeReturnOrder = exports.returnOrder = exports.toggleCompleteOrder = exports.dispatcherOrders = exports.toggleDispatchOrder = exports.orderCancelByUser = exports.orderCancelByAdmin = exports.toggleOrderApproval = exports.adminOrders = exports.userOrders = exports.createOrder = exports.paymentVerification = exports.createOrderForOnlinePayment = exports.calculateShippingCharge = exports.dispatcherOrder = exports.adminOrder = exports.userOrder = exports.singleOrder = exports.order = void 0;
const Orderschema_1 = require("../models/Orderschema");
const adminschema_1 = require("../models/adminschema");
const addressSchema_1 = require("../models/addressSchema");
const Product_1 = require("../models/Product");
const Cart_1 = require("../models/Cart");
const payment_1 = require("../models/payment");
const Remark_1 = require("../models/Remark");
const common_1 = require("../middleware/common");
const dotenv_1 = __importDefault(require("dotenv"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const instance = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const order = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.order_id, 300);
        const order = yield Orderschema_1.Order.findOne({ _id: req.params.order_id })
            .populate("user", "-password -salt -resetPasswordLink -emailVerifyLink")
            .populate("payment", "-user -order")
            .populate({
            path: "product",
            select: "category",
            populate: {
                path: "category",
                model: "Category",
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
            select: "name shopName address isVerified isBlocked holidayMode photo email",
            populate: {
                path: "adminWareHouse",
                model: "AdminWareHouse",
            },
        })
            .populate({
            path: "status.cancelledDetail.remark",
            model: "Remark",
            match: {
                isDeleted: null
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
            res.json({ message: "Order not found", order, status: false });
            return;
        }
        req.order = order;
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.order = order;
const singleOrder = (req, res) => {
    try {
        res.json({ order: req === null || req === void 0 ? void 0 : req.order, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
};
exports.singleOrder = singleOrder;
const userOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let order = req.order;
        if (order.user._id.toString() !== ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.json({ message: "Unauthorized User.", status: false });
            return;
        }
        res.json({ order, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.userOrder = userOrder;
const adminOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        if (order.soldBy._id.toString() !== req.admin._id.toString()) {
            res.json({ message: "Unauthorized Admin.", status: false });
            return;
        }
        res.json({ order, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.adminOrder = adminOrder;
const dispatcherOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        res.json({ order, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.dispatcherOrder = dispatcherOrder;
const calculateShippingCharge = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const superadmin = yield adminschema_1.Admin.findOne({ role: "superadmin" });
        if (!superadmin) {
            res.json({ message: "Cannot find shipping rate", status: false });
            return;
        }
        const shippingAddress = yield addressSchema_1.Address.findOne({
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id,
            isActive: { $ne: null },
        });
        if (!shippingAddress) {
            res.json({ message: "Cannot found shipping address of the user.", status: false });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.calculateShippingCharge = calculateShippingCharge;
// online payment
const createOrderForOnlinePayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { addressId, shippingCharge, method, productId } = req.body;
        console.log(req.body);
        //vaidate address
        const isAddress = yield addressSchema_1.Address.findOne({ _id: addressId });
        if (!isAddress) {
            res.json({ message: "Shipping Address Not found", status: false });
            return;
        }
        let isCart = yield Cart_1.Cart.find({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, isDeleted: null })
            .populate("user")
            .populate("user");
        if (productId) {
            isCart = yield Cart_1.Cart.find({ user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id, product: productId, isDeleted: null })
                .populate("user");
        }
        if (!isCart) {
            res.json({ message: "cart not found", status: false });
            return;
        }
        const productsId = isCart.map((p) => p.product._id.toString());
        let products = yield Product_1.Product.find({ _id: { $in: productsId }, isVerified: { $ne: null }, isDeleted: null })
            .populate("soldBy");
        if (products.length !== isCart.length) {
            res.json({ message: "product not found c", status: true });
            return;
        }
        // if(isCart.find((q)=>q.quantity==undefined || q.quantity <1)){
        //   res.json({message:"product quantity is required",status:true})
        //   return
        // }
        let error;
        for (let i = 0; i < isCart.length; i++) {
            const product = products[i];
            if (product.soldBy.isBlocked || !product.soldBy.isVerified) {
                error = `Seller not available of product ${product.name}`;
                break;
            }
            if (product.quantity < isCart.find(p => p.product._id === (product === null || product === void 0 ? void 0 : product._id)) && isCart.find(p => p.quantity).quantity) {
                error = `There are only ${product.quantity} quantity of product ${product.name} available.`;
                break;
            }
        }
        if (error) {
            res.json({ message: error, status: false });
            return;
        }
        /// order total amount add product price , discount and shipping charge
        const subTotal = isCart.reduce((acc, item) => {
            var _a, _b;
            const discount = (_a = item === null || item === void 0 ? void 0 : item.product) === null || _a === void 0 ? void 0 : _a.quantity;
            const productPrice = (_b = item === null || item === void 0 ? void 0 : item.product) === null || _b === void 0 ? void 0 : _b.price;
            const qunatity = item === null || item === void 0 ? void 0 : item.quantity;
            const productDiscount = productPrice * (1 - discount / 100);
            return acc + productDiscount * (qunatity ? qunatity : 1);
        }, 0);
        let totalAmount = subTotal + (shippingCharge ? shippingCharge : 0);
        //orderOption
        const orderOption = {
            totalAmount,
            paymentMethod: method,
            addressId,
            shippingCharge,
            user: isAddress
        };
        //option
        const options = {
            amount: 100,
            currency: "INR"
        };
        const order = yield instance.orders.create(options);
        res.json({ order, orderOption, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.createOrderForOnlinePayment = createOrderForOnlinePayment;
//payment verification
const paymentVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { order_id, payment_id, signature, orderOption, productId } = req.body;
        const { addressId, paymentMethod, totalAmount, shippingCharge } = orderOption;
        const expectedSignature = crypto_1.default.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${order_id}|${payment_id}`)
            .digest('hex');
        if (expectedSignature === signature) {
            const isAddress = yield addressSchema_1.Address.findOne({ _id: addressId });
            if (!isAddress) {
                res.json({ message: "Shipping Address Not found", status: false });
                return;
            }
            //  const isCart=await Cart.find({user:req.authUser?._id ,isDeleted:null})
            //  .populate("user")
            //  .populate('product')
            let isCart = yield Cart_1.Cart.find({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, isDeleted: null })
                .populate("user")
                .populate('product');
            if (productId) {
                isCart = yield Cart_1.Cart.find({ user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id, product: productId, isDeleted: null })
                    .populate("user")
                    .populate('product');
            }
            if (!isCart) {
                res.json({ message: "cart not found", status: false });
                return;
            }
            const productsId = isCart.map((p) => p.product._id.toString());
            let products = yield Product_1.Product.find({ _id: { $in: productsId }, isVerified: { $ne: null }, isDeleted: null })
                .populate("soldBy");
            let allItems = isCart.map((c) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f;
                let thisProduct = products.find((p) => p === null || p === void 0 ? void 0 : p._id)._id.toString() === ((_a = c === null || c === void 0 ? void 0 : c.product) === null || _a === void 0 ? void 0 : _a._id.toString())
                    && products.find((p) => p === null || p === void 0 ? void 0 : p._id);
                let newOrder = new Orderschema_1.Order();
                newOrder.user = (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id;
                newOrder.product = thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct._id;
                newOrder.soldBy = (_c = thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct.soldBy) === null || _c === void 0 ? void 0 : _c._id;
                newOrder.quantity = c === null || c === void 0 ? void 0 : c.quantity;
                newOrder.isPaid = true;
                newOrder.shipto = {
                    city: isAddress.city,
                    area: isAddress.area,
                    address: isAddress.address,
                    phoneno: isAddress.phone,
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
                let newPayment = new payment_1.Payment({
                    user: (_d = req.authUser) === null || _d === void 0 ? void 0 : _d._id,
                    order: newOrder === null || newOrder === void 0 ? void 0 : newOrder._id,
                    method: paymentMethod,
                    shippingCharge: shippingCharge,
                    transactionCode: newOrder._id,
                    amount: Math.round(totalAmount),
                    from: (_e = req === null || req === void 0 ? void 0 : req.authUser) === null || _e === void 0 ? void 0 : _e.phone, //esewa type
                });
                newOrder.payment = newPayment === null || newPayment === void 0 ? void 0 : newPayment._id;
                yield newOrder.save();
                yield newPayment.save();
                //if product is in cart remove from it
                let cart = yield Cart_1.Cart.findOne({ product: thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct._id, user: (_f = req.authUser) === null || _f === void 0 ? void 0 : _f._id, isDeleted: null });
                if (cart) {
                    cart.isDeleted = Date.now();
                    yield cart.save();
                }
                return newOrder;
            }));
            yield Promise.all(allItems);
            console.log(allItems, 500);
            res.json({ status: true });
            return;
        }
        else {
            res.json({ status: false });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.paymentVerification = paymentVerification;
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { addressId, shippingCharge, method, productId } = req.body;
        //vaidate address
        const isAddress = yield addressSchema_1.Address.findOne({ _id: addressId });
        if (!isAddress) {
            res.json({ message: "Shipping Address Not found", status: false });
        }
        let isCart = yield Cart_1.Cart.find({ user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id, isDeleted: null })
            .populate("user");
        if (productId) {
            isCart = yield Cart_1.Cart.find({ user: (_b = req.authUser) === null || _b === void 0 ? void 0 : _b._id, product: productId, isDeleted: null })
                .populate("user");
        }
        if (!isCart) {
            res.json({ message: "cart not found", status: false });
            return;
        }
        //validate products
        const productsId = isCart.map((p) => p.product.toString());
        let products = yield Product_1.Product.find({ _id: { $in: productsId }, isVerified: { $ne: null }, isDeleted: null })
            .populate("soldBy");
        if (products.length !== isCart.length) {
            res.json({ message: "product not found c", status: true });
            return;
        }
        if (isCart.find((q) => q.quantity == undefined || q.quantity < 1)) {
            res.json({ message: "product quantity is required", status: true });
            return;
        }
        let error;
        const isAdminOnHoliday = (first, last) => {
            let week = [0, 1, 2, 3, 4, 5, 6];
            let firstIndex = week.indexOf(first);
            week = week.concat(week.splice(0, firstIndex)); //Shift array so that first day is index 0
            let lastIndex = week.indexOf(last); //Find last day
            //Cut from first day to last day nd check with today day
            return week.slice(0, lastIndex + 1).some((d) => d === new Date().getDay());
        };
        for (let i = 0; i < isCart.length; i++) {
            const product = products[i];
            if (product.soldBy.isBlocked || !product.soldBy.isVerified) {
                error = `Seller not available of product ${product.name}`;
                break;
            }
            if (isAdminOnHoliday(product.soldBy.holidayMode.start, product.soldBy.holidayMode.end)) {
                error = `Seller is on holiday of product ${product.name}. Please order manually `;
                break;
            }
            if (product.quantity < isCart.find(p => p.product === (product === null || product === void 0 ? void 0 : product._id)) && isCart.find(p => p.quantity).quantity) {
                error = `There are only ${product.quantity} quantity of product ${product.name} available.`;
                break;
            }
        }
        if (error) {
            res.json({ message: error, status: false });
            return;
        }
        //create orders
        let allItems = isCart.map((c) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            let thisProduct = products.find((p) => p === null || p === void 0 ? void 0 : p._id)._id.toString() === (c === null || c === void 0 ? void 0 : c.product.toString())
                && products.find((p) => p === null || p === void 0 ? void 0 : p._id);
            let newOrder = new Orderschema_1.Order();
            newOrder.user = (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id;
            newOrder.product = thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct._id;
            newOrder.soldBy = (_b = thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct.soldBy) === null || _b === void 0 ? void 0 : _b._id;
            newOrder.quantity = c === null || c === void 0 ? void 0 : c.quantity;
            newOrder.isPaid = false;
            newOrder.shipto = {
                city: isAddress.city,
                area: isAddress.area,
                address: isAddress.address,
                phoneno: isAddress.phone,
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
            let discountRate = (Number(thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct.price)) - (Number(thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct.price)) * (+(thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct.discountRate) / 100);
            let productQuantity = Number(c.quantity);
            // new payment
            let newPayment = new payment_1.Payment({
                user: (_c = req.authUser) === null || _c === void 0 ? void 0 : _c._id,
                order: newOrder === null || newOrder === void 0 ? void 0 : newOrder._id,
                method: method,
                shippingCharge: shippingCharge,
                transactionCode: newOrder._id,
                amount: Math.round(discountRate * productQuantity),
                from: (_d = req === null || req === void 0 ? void 0 : req.authUser) === null || _d === void 0 ? void 0 : _d.phone, //esewa type
            });
            newOrder.payment = newPayment === null || newPayment === void 0 ? void 0 : newPayment._id;
            yield newOrder.save();
            yield newPayment.save();
            //if product is in cart remove from it
            let cart = yield Cart_1.Cart.findOne({ product: thisProduct === null || thisProduct === void 0 ? void 0 : thisProduct._id, user: (_e = req.authUser) === null || _e === void 0 ? void 0 : _e._id, isDeleted: null });
            if (cart) {
                cart.isDeleted = Date.now();
                yield cart.save();
            }
            return newOrder;
        }));
        allItems = yield Promise.all(allItems);
        res.json({ status: true, message: "successFully orderd" });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.createOrder = createOrder;
const search_orders = (page_1, perPage_1, ...args_1) => __awaiter(void 0, [page_1, perPage_1, ...args_1], void 0, function* (page, perPage, keyword = '', query, res, type) {
    let populateUser = {
        path: `${type}`,
        select: type === 'user' ? 'name' : 'shopName'
    };
    const skip = Number(perPage) * Number(page);
    let sortFactor = { createdAt: 'desc' };
    let orders = yield Orderschema_1.Order.find(query)
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
        .limit(perPage)
        .skip(skip)
        .lean()
        .sort(sortFactor);
    orders = orders.filter(o => o.product !== null);
    let totalCount = orders.length;
    let pagination = Math.ceil(totalCount / Number(perPage));
    res.json({ orders, totalCount, pagination, status: true });
    return;
});
const userOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        let status = req.query.status;
        const keyword = req.query.keyword;
        let query = {
            user: (_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id
        };
        let statusArray = status ? status.split(",") : [];
        console.log(statusArray);
        query = Object.assign(Object.assign({}, query), { "status.currentStatus": { $in: statusArray } });
        if (keyword)
            return yield search_orders(page, perPage, keyword, query, res, 'soldBy');
        let orders = yield Orderschema_1.Order.find(query)
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
            .skip(perPage * page)
            .limit(perPage)
            .lean()
            .sort({ createdAt: -1 });
        // if (!orders.length) {
        //     return res.status(404).json({error: "No orders found"})
        // }
        const totalCount = yield Orderschema_1.Order.countDocuments(query);
        let pagination = Math.ceil(totalCount / Number(perPage));
        res.json({ orders, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.userOrders = userOrders;
const adminOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        const status = req.query.status;
        const price = req.query.price;
        const keyword = req.query.keyword;
        let query = {
            soldBy: (_a = req.admin) === null || _a === void 0 ? void 0 : _a._id
        };
        if (status &&
            (status === "active" ||
                status === "cancel" ||
                status === "return" ||
                status === "complete" ||
                status === "tobereturned" ||
                status === "approve" ||
                status === "dispatch"))
            query = Object.assign(Object.assign({}, query), { "status.currentStatus": status });
        if (keyword)
            return yield search_orders(page, perPage, keyword, query, res, 'user');
        let orders = yield Orderschema_1.Order.find(query)
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
            .skip(perPage * page)
            .limit(perPage)
            .lean()
            .sort({ createdAt: -1 });
        // if (!orders.length) {
        //     return res.status(404).json({error: "No orders found"})
        // }
        const totalCount = yield Orderschema_1.Order.countDocuments(query);
        let pagination = Math.ceil(totalCount / Number(perPage));
        res.json({ orders, totalCount, pagination, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.adminOrders = adminOrders;
const toggleOrderApproval = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        if (order.soldBy._id.toString() !== req.admin._id.toString()) {
            res.json({ message: "Unauthorized Admin", status: false });
            return;
        }
        if (order.status.currentStatus !== "active" &&
            order.status.currentStatus !== "approve") {
            res.json({
                status: false,
                message: `This order cannot be approve or activate. Order current status is ${order.status.currentStatus}`,
            });
            return;
        }
        let product = yield Product_1.Product.findById(order.product);
        let neworder = yield Orderschema_1.Order.findById(order._id);
        if (order.status.currentStatus === "active") {
            neworder.status.currentStatus = "approve";
            neworder.status.approvedDate = Date.now();
            product.quantity = product.quantity - Number(order.quantity);
            if (product.quantity < 1) {
                res.json({ message: "Cannot approve!, product is out of stock.", status: true });
                return;
            }
            product.noOfSoldOut += order.quantity;
            neworder.soldBy = order.soldBy._id;
            yield neworder.save();
            yield product.save();
            res.json({ message: "order Approved", status: true });
            return;
        }
        if (order.status.currentStatus === "approve") {
            neworder.status.currentStatus = "active";
            neworder.status.approvedDate = null;
            product.quantity = product.quantity + order.quantity;
            product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity);
            neworder.soldBy = order.soldBy._id;
            yield neworder.save();
            yield product.save();
            res.json({ message: "order Active", status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.toggleOrderApproval = toggleOrderApproval;
const orderCancelByAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let order = req.order;
        let updateOrder = yield Orderschema_1.Order.findById(order._id);
        if (!req.body.remark) {
            res.json({ message: "Remark is required.", status: false });
            return;
        }
        if (order.soldBy._id.toString() !== req.admin._id.toString()) {
            res.json({ message: "Unauthorized Admin", status: false });
            return;
        }
        if (order.status.currentStatus === "cancel") {
            res.json({ message: "Order has already been cancelled." });
            return;
        }
        if (order.status.currentStatus !== "active" &&
            order.status.currentStatus !== "approve") {
            res.json({
                message: `This order is in ${order.status.currentStatus} state, cannot be cancelled.`,
                status: false
            });
            return;
        }
        let newRemark = yield Remark_1.Remark.create({
            comment: req.body.remark
        });
        console.log(req === null || req === void 0 ? void 0 : req.admin);
        updateOrder.status.currentStatus = "cancel";
        updateOrder.status.cancelledDetail.cancelledDate = Date.now();
        updateOrder.status.cancelledDetail.cancelledByAdmin = req.admin._id;
        updateOrder.status.cancelledDetail.remark = newRemark._id;
        let product = yield Product_1.Product.findById((_a = order === null || order === void 0 ? void 0 : order.product) === null || _a === void 0 ? void 0 : _a._id);
        product.quantity = order.quantity + product.quantity;
        product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity);
        yield updateOrder.save();
        yield product.save();
        yield newRemark.save();
        res.json({ message: "order canceled by admin", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.orderCancelByAdmin = orderCancelByAdmin;
const orderCancelByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let order = req.order;
        let updateOrder = yield Orderschema_1.Order.findById(order._id);
        if (!req.body.remark) {
            res.json({ message: "Remark is required.", status: false });
            return;
        }
        if ((order === null || order === void 0 ? void 0 : order.user._id.toString()) !== ((_a = req.authUser) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.json({ message: "Unauthorized Admin", status: false });
            return;
        }
        if (order.status.currentStatus === "cancel") {
            res.json({ message: "Order has already been cancelled.", status: false });
            return;
        }
        if (order.status.currentStatus !== "active" &&
            order.status.currentStatus !== "approve") {
            res.json({
                message: `This order is in ${order.status.currentStatus} state, cannot be cancelled.`,
                status: false
            });
            return;
        }
        let newRemark = yield Remark_1.Remark.create({
            comment: req.body.remark
        });
        updateOrder.status.currentStatus = "cancel";
        updateOrder.status.cancelledDetail.cancelledDate = Date.now();
        updateOrder.status.cancelledDetail.cancelledByUser = req.authUser._id;
        updateOrder.status.cancelledDetail.remark = newRemark._id;
        let product = yield Product_1.Product.findById(order.product._id);
        product.quantity = order.quantity + product.quantity;
        product.noOfSoldOut = product.noOfSoldOut === 0 ? 0 : product.noOfSoldOut - Number(order.quantity);
        yield updateOrder.save();
        yield product.save();
        yield newRemark.save();
        res.json({ message: "order canceled user", status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.orderCancelByUser = orderCancelByUser;
const toggleDispatchOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        let updateOrder = yield Orderschema_1.Order.findById(order._id);
        console.log(updateOrder, 40);
        if (order.status.currentStatus !== "approve" &&
            order.status.currentStatus !== "dispatch") {
            res.json({
                status: false,
                message: `This order cannot be dispatched or rollback to approve state. Order current status is ${order.status.currentStatus}`,
            });
            return;
        }
        if (order.status.currentStatus === "approve") {
            order.status.currentStatus = "dispatch";
            yield Orderschema_1.Order.findByIdAndUpdate(order._id, {
                status: {
                    currentStatus: "dispatch",
                    dispatchedDetail: {
                        dispatchedDate: Date.now(),
                        dispatchedBy: req.admin._id,
                    }
                }
            });
            // updateOrder.status.dispatchedDetail = {
            //  dispatchedDate: Date.now(),
            //  dispatchedBy: req.admin._id,
            // } 
            // await updateOrder.save();
            res.json({ message: "Order Dispatch", status: true });
            return;
        }
        if (order.status.dispatchedDetail.dispatchedBy._id.toString() !==
            req.admin._id.toString()) {
            res.json({ message: `Unauthorized Dispatcher.`, status: false });
            return;
        }
        if (order.status.currentStatus === "dispatch") {
            order.status.currentStatus = "approve";
            updateOrder.status.dispatchedDetail = {
                dispatchedDate: null,
                dispatchedBy: undefined,
            };
            yield updateOrder.save();
            res.json({ message: "Order Approve", status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.toggleDispatchOrder = toggleDispatchOrder;
const dispatcherOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = Number(req.query.page) - 1;
        const perPage = 10;
        const status = req.query.status;
        let query = { "status.currentStatus": "approve" };
        if (status && status === "tobereturned")
            query = { "status.currentStatus": status };
        let orders = yield Orderschema_1.Order.find(query)
            .skip(perPage * page)
            .limit(perPage)
            .lean()
            .sort({ createdAt: -1 });
        // if (!orders.length) {
        //     return res.status(404).json({error: "No orders are ready to ship."})
        // }
        const totalCount = yield Orderschema_1.Order.countDocuments(query);
        const pagination = Math.ceil(totalCount / perPage);
        res.json({ orders, totalCount, pagination });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.dispatcherOrders = dispatcherOrders;
const toggleCompleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        let updateOrder = yield Orderschema_1.Order.findById(order._id);
        if (order.status.currentStatus !== "complete" &&
            order.status.currentStatus !== "dispatch") {
            res.json({
                status: true,
                message: `This order cannot be completed or rollback to dispatch state. Order current status is ${order.status.currentStatus}`,
            });
            return;
        }
        if (order.status.currentStatus === "dispatch") {
            updateOrder.status.currentStatus = "complete";
            updateOrder.status.completedDate = Date.now();
            updateOrder.isPaid = true;
            yield updateOrder.save();
            res.json({ message: 'Order dispatch', status: true });
            return;
        }
        if (order.status.currentStatus === "complete") {
            updateOrder.status.currentStatus = "dispatch";
            updateOrder.status.dispatchedDetail.dispatchedDate = Date.now();
            updateOrder.status.completedDate = null;
            order.isPaid = false;
            yield updateOrder.save();
            res.json({ message: 'Order complete', status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.toggleCompleteOrder = toggleCompleteOrder;
const returnOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let order = req.order;
        let updateOrder = yield Orderschema_1.Order.findById(order._id);
        if (order.status.currentStatus !== "tobereturned") {
            res.json({
                status: false,
                message: `This order cannot be returned. Order current status is ${order.status.currentStatus}`,
            });
            return;
        }
        // const newRemark = new Remark({ comment: req.body.remark });
        updateOrder.status.currentStatus = "return";
        updateOrder.status.returnedDetail.returnedDate = Date.now();
        // updateOrder.status.returnedDetail.remark = newRemark._id;
        updateOrder.status.returnedDetail.returneddBy = req.dispatch._id;
        // let product = await Product.findById(order.product._id);
        // let updateProduct = product.toObject();
        res.json({ order, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.returnOrder = returnOrder;
const toggletobeReturnOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let order = req.order;
        if (order.status.currentStatus !== "complete" &&
            order.status.currentStatus !== "tobereturned") {
            res.json({
                status: false,
                message: `This order is not ready to return or rollback to complete state. Order current status is ${order.status.currentStatus}`,
            });
            return;
        }
        let updateOrder = yield Orderschema_1.Order.findOne({ _id: order === null || order === void 0 ? void 0 : order._id });
        let payment = yield payment_1.Payment.findOne({ _id: order === null || order === void 0 ? void 0 : order.payment });
        if (order.status.currentStatus === "complete") {
            if (!req.body.remark) {
                res.json({ message: "Remark is required.", status: false });
                return;
            }
            updateOrder.status.currentStatus = "tobereturned";
            updateOrder.status.tobereturnedDate = Date.now();
            let remark = new Remark_1.Remark({
                comment: req.body.remark
            });
            yield remark.save();
            updateOrder.status.returnedDetail.remark.push(remark._id);
            payment.returnedAmount = +((_a = req.body) === null || _a === void 0 ? void 0 : _a.returnedAmount);
            updateOrder.soldBy = order.soldBy._id;
            yield payment.save();
            yield updateOrder.save();
            res.json({ order, status: true });
            return;
        }
        if (order.status.currentStatus === "tobereturned") {
            updateOrder.status.currentStatus = "complete";
            updateOrder.status.tobereturnedDate = null;
            let remark = yield Remark_1.Remark.findOne({ _id: order.status.returnedDetail.remark[0] });
            remark.isDeleted = Date.now();
            payment.returnedAmount = undefined;
            updateOrder.soldBy = order.soldBy._id;
            yield payment.save();
            yield updateOrder.save();
            res.json({ order, status: true });
            return;
        }
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.toggletobeReturnOrder = toggletobeReturnOrder;
const getOrderStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(common_1.allOrderStatus);
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error.message, status: false });
            return;
        }
    }
});
exports.getOrderStatus = getOrderStatus;
