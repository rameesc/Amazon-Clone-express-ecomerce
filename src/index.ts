
import express, { Request, Response } from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import cors from "cors"
import { dbConnection } from "./config/db"

import { userAuth } from "./routers/userAuthRouter"
import { userRouter } from "./routers/userRouter"
import { adminAuthRouter } from "./routers/adminAuthRouter"
import { adminRouter } from "./routers/adminRouter"
import { superadminRouter } from "./routers/superadminRouter"
import { productRouter } from "./routers/productRouter"
import { cartRouter } from "./routers/cart_wishlist"
import { orderRouter } from "./routers/orderRouter"
import { reviewRouter } from "./routers/review_qna_Router"
import { dashBoardRoutre } from "./routers/dashboardRouter"


dotenv.config()

const PORT=process.env.PORT || 3001

dbConnection()


const app=express()
app.use('/public',express.static('public'))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())



app.use('/api',userAuth)
app.use('/api',userRouter)
app.use('/api/admin',adminAuthRouter,adminRouter)
app.use('/api/superadmin',superadminRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/order',orderRouter)
app.use('/api/review',reviewRouter)
app.use('/api/dashboard',dashBoardRoutre)


  app.get('/',(req:Request,res:Response)=>{
           res.json({message:'hello'})
  })

app.listen(PORT,()=>{
    console.log(`server running on ${PORT}`)
})
// Start the server locally

// if (process.env.NODE_ENV !== "production") {
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   }
export default app
