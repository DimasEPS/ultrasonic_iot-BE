import { UserModel } from "../models/User.model.js";

export const authController = {
  // Login user
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const ipAddress = UserModel.extractIpAddress(req);
      const authResult = await UserModel.authenticateUser(
        username,
        password,
        ipAddress
      );

      res.json(authResult);
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.message === "User tidak ditemukan" ||
        error.message === "Password salah"
      ) {
        return res.status(401).json({ message: error.message });
      }

      res.status(500).json({
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Register user
  register: async (req, res) => {
    try {
      const { username, password, role } = req.body;
      const userData = { username, password, role };

      const result = await UserModel.createUser(userData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.message.includes("Missing required fields")) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: "Failed to create user",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get user logs (super admin only)
  getLogs: async (req, res) => {
    try {
      const logs = await UserModel.getAllUserLogs();
      res.json(logs);
    } catch (error) {
      console.error("Get logs error:", error);
      res.status(500).json({
        message: "Failed to retrieve user logs",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};
