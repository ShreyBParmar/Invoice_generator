import express from "express";
import { auth } from "../middleware/auth.js";
import { getDashboard,getDashboardStats,getRevenueAnalytics,getRecentInvoices } from "../controllers/dashboard.js";

const router = express.Router();

router.get("/", auth, getDashboard);

router.get("/stats", auth, getDashboardStats );

router.get("/revenue", auth, getRevenueAnalytics );

router.get("/recent_invoices", auth, getRecentInvoices );


export default router;