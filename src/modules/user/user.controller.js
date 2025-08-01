import {Router} from "express"
import * as userService from "./user.service.js"
import { authentication,authorization} from "../../middleware/authentication.middleware.js"
import { tokenTypeEnum } from "../../utils/security/token.security.js"
import { endpoint } from "./user.authorization.js"
const router= Router()


 router.get("/",authentication(),authorization({accessRoles:endpoint.profile}),userService.profile)
 router.post("/pass",authentication(),userService.updatePassword)

 router.get("/refresh-token",authentication({tokenType:tokenTypeEnum.refresh}),userService.getNewLoginCredentials)

 export default router