import express from "express";
import { auth } from "../middleware/auth.js";
import { addClient } from "../controllers/addClient.js";

const router = express.Router();

router.post("/",auth, addClient);

export default router