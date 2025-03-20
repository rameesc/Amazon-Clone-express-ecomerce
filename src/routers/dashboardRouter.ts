import express from 'express'
import { mothlySalesProducts, mustSellingProduct, totalProductValue } from '../controller/dashboardData';

import { checkAdminSignin } from '../controller/admin_auth';

export const dashBoardRoutre=express.Router();


dashBoardRoutre.get('/totalData',checkAdminSignin,totalProductValue)
dashBoardRoutre.get('/mothlySales',mothlySalesProducts)
dashBoardRoutre.get('/mustSales',checkAdminSignin,mustSellingProduct)