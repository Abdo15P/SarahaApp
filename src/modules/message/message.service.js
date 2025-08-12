import { asyncHandler,successResponse } from "../../utils/response.js";
import * as DBservice from "../../DB/db.service.js"
import { UserModel } from "../../DB/models/User.model.js";
import { uploadFiles } from "../../utils/multer/cloudinary.js";
import { MessageModel } from "../../DB/models/Message.model.js";

export const sendMessage= asyncHandler(
    async(req,res,next)=>{

        if(!req.body.content && !req.files){
            return next(new Error("Message content is required"))
        }
        const {recieverId}= req.params
        // console.log(recieverId)
        if(!await DBservice.findOne({
            model:UserModel,
            filter:{
                _id: recieverId,
                deletedAt:{ $exists: false},
                confirmEmail:{$exists : true},
               
            }
        })){
            return next(new Error("Invalid recipient account",{cause:404}))
        }


        const {content}=req.body
        let attachments=[]
        if(req.files){
            attachments=await uploadFiles({files:req.files,path:`messages/${recieverId}`})
        }

        const [message]= await DBservice.create({
            model:MessageModel,
            data:[{
                content,
                attachments,
                recieverId,
                senderId: req.user?._id
            }]
        })
        return successResponse({ res, status:201,data:{message}})
    }
)