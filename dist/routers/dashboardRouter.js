"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashBoardRoutre = void 0;
const express_1 = __importDefault(require("express"));
const dashboardData_1 = require("../controller/dashboardData");
const admin_auth_1 = require("../controller/admin_auth");
exports.dashBoardRoutre = express_1.default.Router();
exports.dashBoardRoutre.get('/totalData', admin_auth_1.checkAdminSignin, dashboardData_1.totalProductValue);
exports.dashBoardRoutre.get('/mothlySales', dashboardData_1.mothlySalesProducts);
exports.dashBoardRoutre.get('/mustSales', admin_auth_1.checkAdminSignin, dashboardData_1.mustSellingProduct);
