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

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CHECK IF JWT_SECRET IS SET
if (!process.env.JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not set in .env file");
  process.exit(1);
}

console.log("JWT_SECRET is configured");

app.use(cors());
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
