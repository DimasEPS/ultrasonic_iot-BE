import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "../../server.js";

export const authController = {
  // Login user
  login: async (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username=?";
    db.query(sql, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0)
        return res.status(401).json({ message: "User tidak ditemukan" });

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) return res.status(401).json({ message: "Password salah" });

      // Ambil IP address
      const ip =
        req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

      // Update log login ke DB
      const updateSql =
        "UPDATE users SET last_login=NOW(), last_ip=? WHERE id=?";
      db.query(updateSql, [ip, user.id]);

      // Buat token JWT
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || "secret123",
        { expiresIn: "1h" }
      );

      res.json({ token, role: user.role });
    });
  },

  // Register user
  register: async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    try {
      const hash = await bcrypt.hash(password, 10);
      const sql =
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
      db.query(sql, [username, hash, role], (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "User berhasil dibuat", id: result.insertId });
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  // Get user logs (super admin only)
  getLogs: (req, res) => {
    const sql = "SELECT id, username, role, last_login, last_ip FROM users";
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },
};
