import { db } from "../../server.js";

export const distanceController = {
  // Get distance1 data
  getDistance1: (req, res) => {
    db.query(
      "SELECT * FROM distance1 ORDER BY timestamp DESC LIMIT 20",
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
      }
    );
  },

  // Get distance2 data
  getDistance2: (req, res) => {
    db.query(
      "SELECT * FROM distance2 ORDER BY timestamp DESC LIMIT 20",
      (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
      }
    );
  },

  // Post new distance1 data
  postDistance1: (req, res) => {
    const { distances, status } = req.body;

    // Validate required fields
    if (distances === undefined || status === undefined) {
      return res.status(400).json({
        error: "Missing required fields: distances and status",
      });
    }

    // Validate data types
    if (typeof distances !== "number" || typeof status !== "string") {
      return res.status(400).json({
        error:
          "Invalid data types: distances must be number, status must be string",
      });
    }

    const sql =
      "INSERT INTO distance1 (distances, status, timestamp) VALUES (?, ?, NOW())";
    db.query(sql, [distances, status], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({
        message: "Distance1 data inserted successfully",
        id: result.insertId,
        distances: distances,
        status: status,
      });
    });
  },

  // Post new distance2 data
  postDistance2: (req, res) => {
    const { distances, status } = req.body;

    // Validate required fields
    if (distances === undefined || status === undefined) {
      return res.status(400).json({
        error: "Missing required fields: distances and status",
      });
    }

    // Validate data types
    if (typeof distances !== "number" || typeof status !== "string") {
      return res.status(400).json({
        error:
          "Invalid data types: distances must be number, status must be string",
      });
    }

    const sql =
      "INSERT INTO distance2 (distances, status, timestamp) VALUES (?, ?, NOW())";
    db.query(sql, [distances, status], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({
        message: "Distance2 data inserted successfully",
        id: result.insertId,
        distances: distances,
        status: status,
      });
    });
  },

  // Get all distance data (combined)
  getAllDistances: (req, res) => {
    const sql = `
      SELECT 'distance1' AS source, id, distances, status, timestamp FROM distance1
      UNION ALL
      SELECT 'distance2' AS source, id, distances, status, timestamp FROM distance2
      ORDER BY timestamp DESC LIMIT 10
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },
};
