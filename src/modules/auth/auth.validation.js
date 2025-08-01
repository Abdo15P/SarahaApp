import joi from "joi";

export const login=joi.object().keys({
    email:joi.string().email({minDomainSegments:2,maxDomainSegments:3,tlds:{allow:["net","com","edu"]}}).required(),
    password:joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)).required(),
    

}).required().options({allowUnknown:false})

export const signup=login.append({

    fullName:joi.string().min(2).max(20).required().messages({
        "string.min":"min name length is 2 char",
        "any.required":"fullName is mansatory"
    }),
    phone:joi.string().pattern(new RegExp(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/)).required(),
    
    confirmPassword:joi.string().valid(joi.ref("password")).required()

}).required().options({allowUnknown:false})

