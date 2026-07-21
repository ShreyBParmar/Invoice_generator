import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";
import addClientRoutes from "./routes/addClientRoutes.js"
import invoiceRoutes from "./routes/invoiceRoutes.js";
import clientsRoutes from "./routes/clientsRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

// CHECK IF JWT_SECRET IS SET
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set in .env file");
  process.exit(1);
}

console.log("JWT_SECRET is configured");

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb' }));

// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

pool.connect()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/addclient", addClientRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clients", clientsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      success: false, 
      message: `File upload error: ${err.message}` 
    });
  }

  // Handle any other errors
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
