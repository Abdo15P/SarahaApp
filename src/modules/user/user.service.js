
import * as DBService from "../../DB/db.service.js"

import { asyncHandler, successResponse } from "../../utils/response.js"
import { UserModel } from "../../DB/models/User.model.js"
import { decryptEncryption } from "../../utils/security/encryption.security.js"

import { generateLoginCredentials } from "../../utils/security/token.security.js"
import { compareHash, generateHash } from "../../utils/security/hash.security.js"
import { verifyToken } from "../../utils/security/token.security.js"


export const profile = asyncHandler(async (req, res, next) => {

    req.user.phone = await decryptEncryption({ cipherText: req.user.phone })
    return successResponse({ res, data: { user: req.user } })
})

export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
     
    
     
    const credentials= await generateLoginCredentials({user:req.user})
        return successResponse({ res, data: { credentials } })
   
   
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers

    const decoded = await verifyToken({ token: authorization })
    const { oldPassword, newPassword } = req.body
    const match = compareHash({ plaintext: oldPassword, hashValue: req.user.password })
    if (!match) {
        return next(new Error("Invalid login data", { cause: 404 }))
    }

    const hashPassword = await generateHash({ plaintext: newPassword })

    const result = await DBService.updatePass({ model: UserModel, newPass: hashPassword, id: decoded._id })

    return successResponse({ res, data: { result } })


})

