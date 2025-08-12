
import { providerEnum, roleEnum, UserModel } from "../../DB/models/User.model.js"

import { asyncHandler, successResponse } from "../../utils/response.js"
import * as DBService from "../../DB/db.service.js"

import { compareHash, generateHash } from "../../utils/security/hash.security.js"
import { generateEncryption } from "../../utils/security/encryption.security.js"
import { generateLoginCredentials, generateToken, getSignatures, signatureLevelEnum } from "../../utils/security/token.security.js"

import { OAuth2Client} from "google-auth-library"
import { emailEvent } from "../../utils/events/email.event.js"
import { customAlphabet } from "nanoid"





export const signup = asyncHandler(async (req, res, next) => {

   
     const { fullName, email, password, phone } = req.body
    if (await DBService.findOne({ model: UserModel, filter: { email } })) {
        return next(new Error("email exists", { cause: 409 }))
    }

    const hashPassword = await generateHash({ plaintext: password })
    const encPhone = await generateEncryption({ plaintext: phone })
    const otp=customAlphabet('0123456789',6)()
    let otpStartTime=Date.now()
    
    
    const confirmEmailOtp= await generateHash({plaintext:otp})
    const [user] = await DBService.create({ model: UserModel, data: [{ fullName, email, password: hashPassword, phone: encPhone,confirmEmailOtp,otpStartTime:otpStartTime,otpCount:0 }] })
   
    emailEvent.emit("confirmEmail",{to:email,otp:otp})
    return successResponse({ res, status: 201, data: { user } })


})

export const confirmEmail= asyncHandler(async (req, res, next) => {

    const { email,otp } = req.body
    const user=await DBService.findOne({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:false},
            confirmEmailOtp:{$exists:true}
        }
    })
 
    if(!user){
        return next(new Error("Invalid account or already verified", { cause: 404 }))
    }
    

    if(Date.now()>(Number(user.otpStartTime)+120000)){
        
        return next(new Error("otp timed out,resend email to get a new otp", { cause: 408 }))
    }
   
    
     if(!await compareHash({plaintext:otp,hashValue:user.confirmEmailOtp})){
        return next(new Error("Invalid otp"))
    }
    const updatedUser=await DBService.updateOne({
        model:UserModel,
        filter:{email},
        data:{
            confirmEmail:Date.now(),
            $unset:{confirmEmailOtp:true},
            $inc:{__v:1}
        }
    })
    return updatedUser.matchedCount? successResponse({ res, status: 200, data: {} }): next(new Error("Failed to confirm user email"))


})

export const sendForgotPassword= asyncHandler(async (req, res, next) => {

    const {email}= req.body
    const otp= customAlphabet("0123456789",6)()
    const user = await DBService.findOneAndUpdate({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true},
            deletedAt:{$exists: false},
            provider:providerEnum.system
        },
        data:{
            forgotPasswordOtp: await generateHash({plaintext:otp})
        }
    })
    if(!user){
        return next(new Error("Invalid account"))
    }
    emailEvent.emit("sendForgotPassword",{to: email,subject:"Forgot Password",title:"Reset Password",otp})
    return successResponse({ res })


})

export const verifyForgotPassword= asyncHandler(async (req, res, next) => {

    const {email,otp}= req.body
   
    const user = await DBService.findOne({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true},
            deletedAt:{$exists: false},
            forgotPasswordOtp:{$exists:true},
            provider:providerEnum.system
        }
    })
    if(!user){
        return next(new Error("Invalid account",{cause:404}))
    }
    if(!await compareHash({plaintext:otp, hashValue:user.forgotPasswordOtp})){
        return next(new Error("Invalid otp",{cause:400}))
    }
    
    return successResponse({ res })


})

export const resetPassword= asyncHandler(async (req, res, next) => {

    const {email,otp,password}= req.body
   
    const user = await DBService.findOne({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:true},
            deletedAt:{$exists: false},
            forgotPasswordOtp:{$exists:true},
            provider:providerEnum.system
        }
    })
    if(!user){
        return next(new Error("Invalid account",{cause:404}))
    }
    if(!await compareHash({plaintext:otp, hashValue:user.forgotPasswordOtp})){
        return next(new Error("Invalid otp",{cause:400}))
    }
    
    await DBService.updateOne({
        model:UserModel,
        filter:{
            email
        },
        data:{
            password:await generateHash({plaintext:password}),
            changeCredentialsTime: new Date()
        }
    })
    return successResponse({ res })


})

export const resendEmail = asyncHandler(async (req, res, next) => {

   
     const { email} = req.body
    const user=await DBService.findOne({
        model:UserModel,
        filter:{
            email,
            confirmEmail:{$exists:false},
            confirmEmailOtp:{$exists:true}
        }
    })
 
    if(!user){
        return next(new Error("Invalid account or already verified", { cause: 404 }))
    }

    
    if(user.otpCount>4){
        setTimeout(()=>{
             DBService.updateOne({
        model:UserModel,
        filter:{email},
        data:{
            
            otpCount:0,
            $inc:{__v:1}
        }
    })
            
        }, 300000)
        return next(new Error("exceeded no of otps,please try again after 5 minutes", { cause: 408 }))
    }
    const otp=customAlphabet('0123456789',6)()

    
    const confirmEmailOtp= await generateHash({plaintext:otp})
   // const [user] = await DBService.create({ model: UserModel, data: [{ fullName, email, password: hashPassword, phone: encPhone,confirmEmailOtp,otpStartTime:otpStartTime,otpCount:0 }] })
   const updatedUser=await DBService.updateOne({
        model:UserModel,
        filter:{email},
        data:{
            confirmEmailOtp:confirmEmailOtp,
            otpStartTime:Date.now(),
            $inc:{otpCount:1,__v:1}
            
        }
    })
    

    emailEvent.emit("confirmEmail",{to:email,otp:otp})
    return successResponse({ res, status: 201, data: { updatedUser } })


})

export const login = asyncHandler(async (req, res, next) => {
     
    const { email, password } = req.body

    const user = await DBService.findOne({ model: UserModel, filter: { email,provider:providerEnum.system } })
    if (!user) {
        return next(new Error("Invalid login  data", { cause: 404 }))
    }
     if (!user.confirmEmail) {
        return next(new Error("Please verify your email", { cause: 400}))
    }
    
    if (user.deletedAt) {
        return next(new Error("This account is deleted", { cause: 400}))
    }

    const match = await compareHash({ plaintext: password, hashValue: user.password })

    if (!match) {

        return next(new Error("Invalid login data", { cause: 404 }))
    }

    
   const credentials= await generateLoginCredentials({user})

    return successResponse({ res, data: {credentials } })


})

async function verifyGoogleAccount({idToken}={}){

    
const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID.split(","),  
  });
  const payload = ticket.getPayload();
  return payload
}

export const signupwithGmail = asyncHandler(async (req, res, next) => {

    const {idToken}=req.body
    const {picture,name,email,email_verified} = await verifyGoogleAccount({idToken})
    if(!email_verified){
        return next(new Error("account not verified",{cause:400}))
    }

    const user =await DBService.findOne({model:UserModel,filter:{email}})
    if(user){
        if(user.provider===providerEnum.google){
            
            return loginwithGmail(req,res,next)
        }
        return next(new Error("email exists",{cause:409}))
    }
    const [newUser] =await DBService.create({
        model:UserModel,
        data:[{
            fullName:name,
            email,
            picture,
            confirmEmail:Date.now(),
            provider:providerEnum.google
        }]
    })
     const credentials=await generateLoginCredentials({user:newUser})
    return successResponse({ res, status: 201, data: { credentials } })
    


})


export const loginwithGmail = asyncHandler(async (req, res, next) => {

    const {idToken}=req.body
    const {email,email_verified} = await verifyGoogleAccount({idToken})
    if(!email_verified){
        return next(new Error("account not verified",{cause:400}))
    }

    const user =await DBService.findOne({model:UserModel,filter:{email,provider:providerEnum.google}})
    if(!user){
        return next(new Error("invalid login data or invalid provider",{cause:404}))
    }
    
    const credentials=await generateLoginCredentials({user})
    return successResponse({ res, status: 200, data: { credentials } })

})