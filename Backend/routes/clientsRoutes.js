import express from "express";
import { auth } from "../middleware/auth.js";
import { getUserClients } from "../controllers/clients.js";

const router = express.Router();

router.get("/", auth, getUserClients);

export default router;
