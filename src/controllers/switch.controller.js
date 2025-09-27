import { db } from "../../server.js";

export const controlController = {
  // Get TV control status
  getControlStatus: (req, res) => {
    db.query("SELECT TV FROM switch_condition WHERE id=1", (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result[0]);
    });
  },

  // Update TV control
  updateControlStatus: (req, res) => {
    const { TV } = req.body;
    const sql = "UPDATE switch_condition SET TV=? WHERE id=1";
    db.query(sql, [TV], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: "TV control updated successfully" });
    });
  },
};
