import express from "express"
import { signUp } from "../controllers/signUp.js"
import { account } from "../controllers/account.js"
import { business } from "../controllers/business.js"
import { auth } from "../middleware/auth.js"

const router=express.Router()

router.post("/signup", signUp)
router.post("/account", account)
router.post("/business", auth, business)

export default router