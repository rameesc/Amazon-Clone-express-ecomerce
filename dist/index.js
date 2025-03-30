"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const userAuthRouter_1 = require("./routers/userAuthRouter");
const userRouter_1 = require("./routers/userRouter");
const adminAuthRouter_1 = require("./routers/adminAuthRouter");
const adminRouter_1 = require("./routers/adminRouter");
const superadminRouter_1 = require("./routers/superadminRouter");
const productRouter_1 = require("./routers/productRouter");
const cart_wishlist_1 = require("./routers/cart_wishlist");
const orderRouter_1 = require("./routers/orderRouter");
const review_qna_Router_1 = require("./routers/review_qna_Router");
const dashboardRouter_1 = require("./routers/dashboardRouter");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3001;
(0, db_1.dbConnection)();
const app = (0, express_1.default)();
const publicPath = path_1.default.join(process.cwd(), 'public');
app.use('/public', express_1.default.static(publicPath));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use('/api', userAuthRouter_1.userAuth);
app.use('/api', userRouter_1.userRouter);
app.use('/api/admin', adminAuthRouter_1.adminAuthRouter, adminRouter_1.adminRouter);
app.use('/api/superadmin', superadminRouter_1.superadminRouter);
app.use('/api/product', productRouter_1.productRouter);
app.use('/api/cart', cart_wishlist_1.cartRouter);
app.use('/api/order', orderRouter_1.orderRouter);
app.use('/api/review', review_qna_Router_1.reviewRouter);
app.use('/api/dashboard', dashboardRouter_1.dashBoardRoutre);
app.get('/', (req, res) => {
    res.json({ message: 'hello' });
});
app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
// Start the server locally
// if (process.env.NODE_ENV !== "production") {
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   }
exports.default = app;
