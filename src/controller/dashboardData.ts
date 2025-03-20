import { Request, Response } from "express"
import { Product } from "../models/Product"
import { Order } from "../models/Orderschema"
import { OrderProps } from "../types/types"
import { number, string } from "zod"
import items from "razorpay/dist/types/items"


export const totalProductValue=async(req:Request,res:Response)=>{


    try{
        
        const adminId=req.admin._id

        const query={
            soldBy:adminId,
            isVerified:{$ne:null},
            isDeleted:null,
            isRejected:null


        }
        const ordersItem={
            soldBy:adminId,
            "status.currentStatus":"complete"
        }

        const products=await Product.find(query)

        const orders=await Order.find(ordersItem)
        .populate('payment')

        const totalSales=orders.reduce((acc,curr)=>{
          

          return  acc+(curr?.quantity||0)

        },0)
        const totalRevanue=orders.reduce((acc,curr)=>{

          return  acc+(curr?.payment?.amount ||0)

        },0)



        res.json({
            
            products:products.length,
             orders:orders?.length,
            totalSales:totalSales,
            totalRevanue:totalRevanue,
            status:true
        })


    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error?.message,status:false})
            return
        }
    }

}

export const mothlySalesProducts=async(req:Request,res:Response)=>{

    try{
          const adminId='678542d7948ce8fc8148e9ff'
        const ordersItem={
            soldBy:adminId,
            "status.currentStatus":"complete"
        }
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];

        

        const getMonthValue=(createdAt:string)=>{
            const date=new Date(createdAt)
            const month=date.getMonth()
            const year=date.getFullYear()
            return {
                month,
                year
            }

        }

        
        const orders=await Order.find(ordersItem)
        .populate('product')
        .populate('payment')


        

        const monthlyData=orders.reduce((acc,curr:OrderProps)=>{
            const {month,year}=getMonthValue(curr?.createdAt as string)
            const existinItem=acc.find((p:any)=>p.month==`${monthNames[month+1]}-${year}`)
            if(existinItem){
                existinItem.amount+=curr?.payment?.amount
                existinItem.sales+=curr?.quantity
            }else{
                acc.push({
                    month:`${monthNames[month+1]}-${year}`,
                    name:curr?.product?.name,
                    sales:curr?.quantity,
                    amount:curr?.payment?.amount||0
                })
            }

             return acc

        },[] as {month:string,amount:number,sales:number,name:string}[])

       

        res.json({monthlyData,status:true})
        return

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error?.message,status:false})
            return
        }
    }

}

export const mustSellingProduct=async(req:Request,res:Response)=>{

    try{

          const query={
            soldBy:req?.admin?._id
          }

          const mustSelling = await Product.find(query)
          .select("name  noOfSoldOut -_id")
          .sort({noOfSoldOut:-1})
          .limit(3)

        res.json({mustSelling,status:true})

    }catch(error:unknown){

        if(error instanceof Error){
            res.json({message:error?.message,status:false})
            return
        }
    }
}