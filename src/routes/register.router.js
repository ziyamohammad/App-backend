import {Router} from "express"
import { amountadd, loginuser, password, registeruser, resetpassword, token, verifypassword } from "../controllers/user.controller.js"
import { verifyjwt } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/register").post(registeruser)
router.route("/login").post(loginuser)
router.route("/otp").post(resetpassword)
router.route("/verify").post(verifypassword)
router.route("/change").post(password)
router.route("/add").post(verifyjwt,amountadd)
router.route("/all").post(token)

export default router