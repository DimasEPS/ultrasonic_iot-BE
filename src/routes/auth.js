import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { authController } from "../controllers/auth.controller.js";

const router = express.Router();

// LOGIN
router.post("/login", authController.login);

// REGISTER
router.post("/register", authController.register);

// SUPER ADMIN - Lihat log login semua user
router.get("/logs", verifyToken(["super-admin"]), authController.getLogs);

export default router;
