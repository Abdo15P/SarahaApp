import {Router} from "express"
import * as authService from "./auth.service.js"
import * as validators from "./auth.validation.js"
import { validation } from "../../middleware/validation.middleware.js"
const router= Router()

router.post("/signup",validation(validators.signup),authService.signup)
router.patch("/confirm-email",authService.confirmEmail)
router.patch("/resend-email",authService.resendEmail)
router.post("/login",validation(validators.login),authService.login)

router.post("/signup/gmail",authService.signupwithGmail)
router.post("/login/gmail",authService.loginwithGmail)



export default router