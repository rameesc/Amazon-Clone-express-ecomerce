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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustSellingProduct = exports.mothlySalesProducts = exports.totalProductValue = void 0;
const Product_1 = require("../models/Product");
const Orderschema_1 = require("../models/Orderschema");
const totalProductValue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = req.admin._id;
        const query = {
            soldBy: adminId,
            isVerified: { $ne: null },
            isDeleted: null,
            isRejected: null
        };
        const ordersItem = {
            soldBy: adminId,
            "status.currentStatus": "complete"
        };
        const products = yield Product_1.Product.find(query);
        const orders = yield Orderschema_1.Order.find(ordersItem)
            .populate('payment');
        const totalSales = orders.reduce((acc, curr) => {
            return acc + ((curr === null || curr === void 0 ? void 0 : curr.quantity) || 0);
        }, 0);
        const totalRevanue = orders.reduce((acc, curr) => {
            var _a;
            return acc + (((_a = curr === null || curr === void 0 ? void 0 : curr.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0);
        }, 0);
        res.json({
            products: products.length,
            orders: orders === null || orders === void 0 ? void 0 : orders.length,
            totalSales: totalSales,
            totalRevanue: totalRevanue,
            status: true
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.totalProductValue = totalProductValue;
const mothlySalesProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const adminId = '678542d7948ce8fc8148e9ff';
        const ordersItem = {
            soldBy: adminId,
            "status.currentStatus": "complete"
        };
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const getMonthValue = (createdAt) => {
            const date = new Date(createdAt);
            const month = date.getMonth();
            const year = date.getFullYear();
            return {
                month,
                year
            };
        };
        const orders = yield Orderschema_1.Order.find(ordersItem)
            .populate('product')
            .populate('payment');
        const monthlyData = orders.reduce((acc, curr) => {
            var _a, _b, _c;
            const { month, year } = getMonthValue(curr === null || curr === void 0 ? void 0 : curr.createdAt);
            const existinItem = acc.find((p) => p.month == `${monthNames[month + 1]}-${year}`);
            if (existinItem) {
                existinItem.amount += (_a = curr === null || curr === void 0 ? void 0 : curr.payment) === null || _a === void 0 ? void 0 : _a.amount;
                existinItem.sales += curr === null || curr === void 0 ? void 0 : curr.quantity;
            }
            else {
                acc.push({
                    month: `${monthNames[month + 1]}-${year}`,
                    name: (_b = curr === null || curr === void 0 ? void 0 : curr.product) === null || _b === void 0 ? void 0 : _b.name,
                    sales: curr === null || curr === void 0 ? void 0 : curr.quantity,
                    amount: ((_c = curr === null || curr === void 0 ? void 0 : curr.payment) === null || _c === void 0 ? void 0 : _c.amount) || 0
                });
            }
            return acc;
        }, []);
        res.json({ monthlyData, status: true });
        return;
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.mothlySalesProducts = mothlySalesProducts;
const mustSellingProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const query = {
            soldBy: (_a = req === null || req === void 0 ? void 0 : req.admin) === null || _a === void 0 ? void 0 : _a._id
        };
        const mustSelling = yield Product_1.Product.find(query)
            .select("name  noOfSoldOut -_id")
            .sort({ noOfSoldOut: -1 })
            .limit(3);
        res.json({ mustSelling, status: true });
    }
    catch (error) {
        if (error instanceof Error) {
            res.json({ message: error === null || error === void 0 ? void 0 : error.message, status: false });
            return;
        }
    }
});
exports.mustSellingProduct = mustSellingProduct;
