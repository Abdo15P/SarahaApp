import {Router} from "express"
import * as authService from "./auth.service.js"
import * as validators from "./auth.validation.js"
import { validation } from "../../middleware/validation.middleware.js"
const router= Router({
    caseSensitive:true,
    strict:true
})

router.post("/signup",validation(validators.signup),authService.signup)
router.patch("/confirm-email",validation(validators.confirmEmail),authService.confirmEmail)
router.patch("/resend-email",authService.resendEmail)
router.post("/login",validation(validators.login),authService.login)
router.patch("/send-forgot-passowrd",validation(validators.sendForgotPassword),authService.sendForgotPassword)
router.patch("/verify-forgot-passowrd",validation(validators.verifyForgotPassword),authService.verifyForgotPassword)
router.patch("/reset-forgot-passowrd",validation(validators.resetPassword),authService.resetPassword)

router.post("/signup/gmail",validation(validators.loginwithGmail),authService.signupwithGmail)
router.post("/login/gmail",validation(validators.loginwithGmail),authService.loginwithGmail)



export default router