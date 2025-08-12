import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { fileValidation } from "../../utils/multer/cloud.multer.js";
export const sendMessage={
    params: joi.object().keys({
        recieverId: generalFields.id.required()
    }).required(),

     body: joi.object().keys({
        content: joi.string().min(2).max(200000)
    }).required(),
    files: joi.array().items(
        joi.object().keys({
                                fieldname:generalFields.file.fieldname.valid('attachments').required(),
                                originalname: generalFields.file.originalname.required(),
                                encoding:generalFields.file.encoding.required(),
                                mimetype:generalFields.file.fieldname.valid(...fileValidation.image).required(),
                              
                                destination:generalFields.file.destination.required(),
                                filename:generalFields.file.filename.required(),
                                path: generalFields.file.path.required(),
                                size:generalFields.file.size.max(3*1024*1024).required(),
                })
               ).min(0).max(2)
        }
    
