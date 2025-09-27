import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { controlController } from "../controllers/switch.controller.js";

const router = express.Router();

// GET kontrol - IoT devices get control status (No Authentication Required)
router.get("/", controlController.getControlStatus);

// UPDATE kontrol (hanya super-admin) - Web dashboard updates control
router.post(
  "/",
  verifyToken(["super-admin"]),
  controlController.updateControlStatus
);

export default router;
