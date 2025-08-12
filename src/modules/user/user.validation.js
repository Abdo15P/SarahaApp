import joi from 'joi'
import { generalFields } from '../../middleware/validation.middleware.js'
import { logoutEnum } from '../../utils/security/token.security.js'
import { fileValidation } from '../../utils/multer/local.multer.js'

export const logout={
    body: joi.object().keys({
        flag:joi.string().valid(...Object.values(logoutEnum)).default(logoutEnum.stayLoggedIn)
    })
}


export const shareProfile={
    params: joi.object().keys({
        userId:generalFields.id.required()
    })
}


export const profileImage={
   file: joi.object().keys({
                    fieldname:generalFields.file.fieldname.valid('image').required(),
                    originalname: generalFields.file.originalname.required(),
                    encoding:generalFields.file.encoding.required(),
                    mimetype:generalFields.file.fieldname.valid(...fileValidation.image).required(),
                    //finalPath: generalFields.file.finalPath.required(),
                    destination:generalFields.file.destination.required(),
                    filename:generalFields.file.filename.required(),
                    path: generalFields.file.path.required(),
                    size:generalFields.file.size.max(3*1024*1024).required(),
   }).required()
}

export const coverImage={
   files: joi.array().items(
    joi.object().keys({
                    fieldname:generalFields.file.fieldname.valid('images').required(),
                    originalname: generalFields.file.originalname.required(),
                    encoding:generalFields.file.encoding.required(),
                    mimetype:generalFields.file.fieldname.valid(...fileValidation.image).required(),
                   // finalPath: generalFields.file.finalPath.required(),
                    destination:generalFields.file.destination.required(),
                    filename:generalFields.file.filename.required(),
                    path: generalFields.file.path.required(),
                    size:generalFields.file.size.max(3*1024*1024).required(),
    }).required()
   ).min(1).max(2).required()
}

export const updateBasicInfo={
    body: joi.object().keys({
        fullName:generalFields.fullName,
        phone:generalFields.phone,
        gender: generalFields.gender
    }).required()
}

export const updatePassword={
    body: logout.body.append({
        oldPassword:generalFields.password.required(),
        password:generalFields.password.not(joi.ref("oldPassword")).required(),
        confirmPassowrd: generalFields.confirmPassword.required()
    }).required()
}


export const freezeAccount={
    params: joi.object().keys({
        userId:generalFields.id
    })
}
export const restoreAccount={
    params: joi.object().keys({
        userId:generalFields.id.required()
    })
}

export const deleteAccount={
    params: joi.object().keys({
        userId:generalFields.id.required()
    })
}