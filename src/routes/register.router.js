import {Router} from "express"
import { loginuser, password, registeruser, resetpassword, verifypassword } from "../controllers/user.controller.js"

const router = Router()

router.route("/register").post(registeruser)
router.route("/login").post(loginuser)
router.route("/otp").post(resetpassword)
router.route("/verify").post(verifypassword)
router.route("/change").post(password)

export default router