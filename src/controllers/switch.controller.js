import { ControlModel } from "../models/Control.model.js";

export const controlController = {
  // Get TV control status
  getControlStatus: async (req, res) => {
    try {
      const status = await ControlModel.getControlStatus();
      res.json(status);
    } catch (error) {
      console.error("Get Control Status error:", error);
      res.status(500).json({
        message: "Failed to retrieve control status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Update TV control
  updateControlStatus: async (req, res) => {
    try {
      const { TV } = req.body;
      const result = await ControlModel.updateControlStatus({ TV });
      res.json(result);
    } catch (error) {
      console.error("Update Control Status error:", error);

      if (
        error.message.includes("is required") ||
        error.message.includes("must be")
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: "Failed to update control status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Toggle TV status
  toggleTVStatus: async (req, res) => {
    try {
      const result = await ControlModel.toggleTVStatus();
      res.json(result);
    } catch (error) {
      console.error("Toggle TV Status error:", error);
      res.status(500).json({
        message: "Failed to toggle TV status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get device status summary
  getDeviceStatusSummary: async (req, res) => {
    try {
      const summary = await ControlModel.getDeviceStatusSummary();
      res.json(summary);
    } catch (error) {
      console.error("Get Device Status Summary error:", error);
      res.status(500).json({
        message: "Failed to retrieve device status summary",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get control history
  getControlHistory: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const history = await ControlModel.getControlHistory(limit);
      res.json(history);
    } catch (error) {
      console.error("Get Control History error:", error);
      res.status(500).json({
        message: "Failed to retrieve control history",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Initialize control status
  initializeControlStatus: async (req, res) => {
    try {
      const result = await ControlModel.initializeControlStatus();
      res.json(result);
    } catch (error) {
      console.error("Initialize Control Status error:", error);
      res.status(500).json({
        message: "Failed to initialize control status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};
