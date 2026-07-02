import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  getUserInvoices,
} from "../controllers/invoice.js";
import { auth } from "../middleware/auth.js";
import { getAllInvoices } from "../controllers/invoicesdata.js";
import { getReportData } from "../controllers/getReportData.js";

const router = express.Router();
// ============================================
// CONFIGURE MULTER FOR FILE UPLOADS
// ============================================

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// ============================================
// ROUTES
// ============================================

// Create invoice with logo
router.post("/", auth, upload.single("logo"), createInvoice);

// Get all invoices for user
router.get("/", auth, getUserInvoices);

router.get("/table", auth, getAllInvoices );

router.get(
    "/report",
    auth,
    getReportData
);

// Get invoice by ID
router.get("/:invoiceId", auth, getInvoice);

// Update invoice
router.put("/:invoiceId", auth, upload.single("logo"), updateInvoice);

// Delete invoice
router.delete("/:invoiceId", auth, deleteInvoice);

export default router;