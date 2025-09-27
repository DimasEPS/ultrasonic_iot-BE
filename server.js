import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./src/routes/auth.js";
import distanceRoutes from "./src/routes/distance.js";
import controlRoutes from "./src/routes/control.js";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// koneksi DB
export const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Database connected");
});

// routes
app.use("/api/auth", authRoutes); // login & register
app.use("/api/distance", distanceRoutes);
app.use("/api/control", controlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
