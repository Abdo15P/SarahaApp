import { Types } from "mongoose"
import { asyncHandler } from "../utils/response.js"
import joi from "joi"
import { genderEnum } from "../DB/models/User.model.js"
import { fileValidation } from "../utils/multer/local.multer.js"
export const generalFields={
    fullName:joi.string().pattern(/^[A-Z][a-z]{1,19}\s{1}[A-Z][a-z]{1,19}$/).min(2).max(20).messages({
            "string.min":"min name length is 2 char",
            "any.required":"fullName is mansatory"
        }),
        phone:joi.string().pattern(new RegExp(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/)),
        
        confirmPassword:joi.string().valid(joi.ref("password")),
        email:joi.string().email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:["net","com","edu"]}}),
        password:joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)),
        otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
        gender: joi.string().valid(...Object.values(genderEnum)),
        id: joi.string().custom(
            (value,helper)=>{
                return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId ")
            }
        ),
        file:{
            fieldname:joi.string(),
                originalname: joi.string(),
                encoding:joi.string(),
                mimetype:joi.string(),
                finalPath: joi.string(),
                destination:joi.string(),
                filename:joi.string(),
                path: joi.string(),
                size:joi.number().positive().max(3*1024*1024),
        },
        
}
export const validation=(schema)=>{
    return asyncHandler(
        async(req,res,next)=>{


            const validationError=[]
            for (const key of Object.keys(schema)){
                const validationResult=schema[key].validate(req[key],{abortEarly:false})
                
                if(validationResult.error){
                    validationError.push({
                        key,details: validationResult.error.details.map(ele => {
                            return {message: ele.message,path:ele.path[0]}
                        })
                    })
                }
            }
            if(validationError.length){
                return res.status(400).json({error_message:"Validation error",validationError})
            }
            
                return next()
        }
    )
}

