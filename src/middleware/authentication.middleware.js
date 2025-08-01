import { asyncHandler } from "../utils/response.js"
import { decodedToken, tokenTypeEnum } from "../utils/security/token.security.js"


export const authentication =({tokenType=tokenTypeEnum.access}={})=>{
    return asyncHandler(async(req,res,next)=>{
        req.user= await decodedToken({next,authorization:req.headers.authorization,tokenType})
        return next()
    })
}
export const authorization =({accessRoles=[]}={})=>{
    return asyncHandler(async(req,res,next)=>{
       if(!accessRoles.includes(req.user.role)){
        return next(new Error("Not authorized account",{cause:403}))
       }
        return next()
    })
}