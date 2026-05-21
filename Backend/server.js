import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

pool.connect()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

app.use("/api/auth",authRoutes)
app.use("/api/dashboard",dashboardRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
