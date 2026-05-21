import express from "express";
import { auth } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboard.js";

const router = express.Router();

router.get("/", auth, getDashboard);

export default router;