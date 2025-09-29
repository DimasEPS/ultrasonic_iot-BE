import { DistanceModel } from "../models/Distance.model.js";

export const distanceController = {
  // Get distance1 data
  getDistance1: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await DistanceModel.getDistanceData("1", limit);
      res.json(data);
    } catch (error) {
      console.error("Get Distance1 error:", error);
      res.status(500).json({
        message: "Failed to retrieve distance1 data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get distance2 data
  getDistance2: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const data = await DistanceModel.getDistanceData("2", limit);
      res.json(data);
    } catch (error) {
      console.error("Get Distance2 error:", error);
      res.status(500).json({
        message: "Failed to retrieve distance2 data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Post new distance1 data
  postDistance1: async (req, res) => {
    try {
      const { distances, status } = req.body;
      const result = await DistanceModel.insertDistanceData("1", {
        distances,
        status,
      });
      res.status(201).json(result);
    } catch (error) {
      console.error("Post Distance1 error:", error);

      if (
        error.message.includes("Missing required fields") ||
        error.message.includes("must be")
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: "Failed to insert distance1 data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Post new distance2 data
  postDistance2: async (req, res) => {
    try {
      const { distances, status } = req.body;
      const result = await DistanceModel.insertDistanceData("2", {
        distances,
        status,
      });
      res.status(201).json(result);
    } catch (error) {
      console.error("Post Distance2 error:", error);

      if (
        error.message.includes("Missing required fields") ||
        error.message.includes("must be")
      ) {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({
        message: "Failed to insert distance2 data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get all distance data (combined)
  getAllDistances: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const data = await DistanceModel.getAllDistanceData(limit);
      res.json(data);
    } catch (error) {
      console.error("Get All Distances error:", error);
      res.status(500).json({
        message: "Failed to retrieve distance data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get latest reading from specific sensor
  getLatestReading: async (req, res) => {
    try {
      const { sensorType } = req.params;

      if (!["1", "2"].includes(sensorType)) {
        return res
          .status(400)
          .json({ message: "Invalid sensor type. Must be '1' or '2'" });
      }

      const data = await DistanceModel.getLatestReading(sensorType);

      if (!data) {
        return res
          .status(404)
          .json({ message: `No data found for sensor ${sensorType}` });
      }

      res.json(data);
    } catch (error) {
      console.error("Get Latest Reading error:", error);
      res.status(500).json({
        message: "Failed to retrieve latest reading",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Get statistics for specific sensor
  getStatistics: async (req, res) => {
    try {
      const { sensorType } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      if (!["1", "2"].includes(sensorType)) {
        return res
          .status(400)
          .json({ message: "Invalid sensor type. Must be '1' or '2'" });
      }

      const stats = await DistanceModel.getDistanceStatistics(
        sensorType,
        hours
      );
      res.json(stats);
    } catch (error) {
      console.error("Get Statistics error:", error);
      res.status(500).json({
        message: "Failed to retrieve statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Cleanup old data
  cleanupOldData: async (req, res) => {
    try {
      const { sensorType } = req.params;
      const days = parseInt(req.query.days) || 30;

      if (!["1", "2"].includes(sensorType)) {
        return res
          .status(400)
          .json({ message: "Invalid sensor type. Must be '1' or '2'" });
      }

      const result = await DistanceModel.cleanupOldData(sensorType, days);
      res.json(result);
    } catch (error) {
      console.error("Cleanup Old Data error:", error);
      res.status(500).json({
        message: "Failed to cleanup old data",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
};
