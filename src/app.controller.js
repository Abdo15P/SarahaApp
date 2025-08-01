import express from "express"
import authController from "./modules/auth/auth.controller.js"

import userController from "./modules/user/user.controller.js"
import connectDB from "./DB/connection.db.js"
import { globalErrorHandling } from "./utils/response.js"
import path from   'node:path'
import * as dotenv from 'dotenv'
import cors from 'cors'


dotenv.config({path: path.join('./src/config/.env.dev')})

const bootstrap=async ()=>{
const app=express()
const port=process.env.PORT || 5000

app.use(cors())
await connectDB()

app.use(express.json())
app.get('/',(req,res)=>
     res.json({message:"Welcome"}))
app.use("/auth",authController)

app.use("/user",userController)
app.all('{/*dummy}',(req,res)=>
     res.status(404).json({message:"invalid routing"}))

app.use(globalErrorHandling)


return app.listen(port,()=> console.log(`app listening on port ${port}`))
}
export default bootstrap
