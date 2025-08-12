import express from "express"
import authController from "./modules/auth/auth.controller.js"

import userController from "./modules/user/user.controller.js"
import messageController from "./modules/message/message.controller.js"
import connectDB from "./DB/connection.db.js"
import { globalErrorHandling } from "./utils/response.js"
import path from   'node:path'
import * as dotenv from 'dotenv'
import cors from 'cors'
import morgan from "morgan"
import helmet from "helmet"
import {rateLimit} from "express-rate-limit"


// dotenv.config({path: path.join('./src/config/.env.dev')})
dotenv.config({})
const bootstrap=async ()=>{
const app=express()
const port=process.env.PORT || 5000

app.use(cors())
app.use(helmet())

const limiter = rateLimit({
     windowMs:60*60*1000,
     limit:2000,
     standardHeaders:"draft-8"
})
app.use(limiter)
// const Ulimiter = rateLimit({
//      windowMs:60*60*1000,
//      limit:2000,
//      legacyHeaders:false,
//      standardHeaders:"draft-8"
// })
// app.use("user",Ulimiter)
app.use(morgan('dev'))
await connectDB()

app.use(express.json())
app.use("/uploads",express.static(path.resolve('./src/uploads')))

app.get('/',(req,res)=>
     res.json({message:"Welcome"}))
app.use("/auth",authController)

app.use("/user",userController)
app.use("/message",messageController)
app.all('{/*dummy}',(req,res)=>
     res.status(404).json({message:"invalid routing"}))

app.use(globalErrorHandling)


return app.listen(port,()=> console.log(`app listening on port ${port}`))
}
export default bootstrap
