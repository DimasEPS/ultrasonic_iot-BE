import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { distanceController } from "../controllers/distance.controller.js";

const router = express.Router();

// Admin-distance1 → hanya bisa lihat distance1
router.get(
  "/1",
  verifyToken(["admin-distance1", "super-admin"]),
  distanceController.getDistance1
);

// Admin-distance2 → hanya bisa lihat distance2
router.get(
  "/2",
  verifyToken(["admin-distance2", "super-admin"]),
  distanceController.getDistance2
);

// Super admin → bisa lihat gabungan
router.get(
  "/all",
  verifyToken(["super-admin"]),
  distanceController.getAllDistances
);

// POST - IoT devices send distance data (No Authentication Required)
router.post("/1", distanceController.postDistance1);
router.post("/2", distanceController.postDistance2);

export default router;
