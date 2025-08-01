import jwt from 'jsonwebtoken'
import * as DBService from '../../DB/db.service.js'
import { UserModel } from "../../DB/models/User.model.js"
import { roleEnum } from '../../DB/models/User.model.js'

export const signatureLevelEnum={bearer:"Bearer",system:"System"}
export const tokenTypeEnum={access:"access",refresh:"refresh"}


export  const generateToken=async({payload={},secret=process.env.ACCESS_USER_TOKEN_SIGNATURE,options={expiresIn:Number(process.env.ACCESS_TOKEN_EXPIRES_IN)}}={})=>{

    return jwt.sign(payload,secret,options)
}

export  const  verifyToken=async({token="",secret=process.env.ACCESS_USER_TOKEN_SIGNATURE}={})=>{

    return jwt.verify(token,secret)
}

export const getSignatures= async ({signatureLevel=signatureLevelEnum.bearer}={})=>{
    let signatures={accessSignature:undefined,refreshSignature:undefined}
    console.log(signatureLevel)
    switch(signatureLevel){
        case signatureLevelEnum.system:
        signatures.accessSignature=process.env.ACCESS_SYSTEMS_TOKEN_SIGNATURE
        signatures.refreshSignature=process.env.REFRESH_SYSTEMS_TOKEN_SIGNATURE
        break;

        default:
            signatures.accessSignature=process.env.ACCESS_USER_TOKEN_SIGNATURE
        signatures.refreshSignature=process.env.REFRESH_USER_TOKEN_SIGNATURE
            break;

    }
    
    return signatures
}

export const decodedToken=async({next,authorization="",tokenType=tokenTypeEnum.access}={})=>{
    
        const [bearer,token]=authorization?.split(' ') || []
        
        if (!bearer || !token){
            return next(new Error('missing token parts',{cause:401}))
        }
        let signatures=await getSignatures({signatureLevel:bearer})
   
        const decoded=await verifyToken({token,
            secret:tokenType===tokenTypeEnum.access? signatures.accessSignature:signatures.refreshSignature})
        
        if(!decoded?._id){
            return next(new Error("Invalid token",{cause:400}))
        }
        const user =await DBService.findById({model:UserModel,id:decoded._id})
        if(!user){
            return next(new Error("account not registered",{cause:404}))
        }
        return user

}

export const generateLoginCredentials=async({user}={})=>{
    let signatures= await getSignatures({signatureLevel:user.role != roleEnum.user ? signatureLevelEnum.system:signatureLevelEnum.bearer})
        const access_token = await generateToken({ payload: { _id: user._id },secret:signatures.accessSignature })
            const refresh_token = await generateToken({ payload: { _id: user._id }, secret: signatures.refreshSignature, options: { expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN) } })

            return {access_token,refresh_token}
}


















































