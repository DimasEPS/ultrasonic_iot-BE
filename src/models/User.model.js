import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { db } from "../../server.js";

/**
 * User Model
 * Handles all user-related database operations and business logic
 */
export class UserModel {
  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Promise<object|null>} User object or null if not found
   */
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM users WHERE username=?";
      db.query(sql, [username], (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  }

  /**
   * Verify user password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {Promise<boolean>} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user login information
   * @param {number} userId - User ID
   * @param {string} ipAddress - User's IP address
   * @returns {Promise<void>}
   */
  static async updateLoginInfo(userId, ipAddress) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE users SET last_login=NOW(), last_ip=? WHERE id=?";
      db.query(sql, [ipAddress, userId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }

  /**
   * Generate JWT token for user
   * @param {object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1h" }
    );
  }

  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  /**
   * Create new user
   * @param {object} userData - User data {username, password, role}
   * @returns {Promise<object>} Created user result
   */
  static async createUser(userData) {
    const { username, password, role } = userData;

    // Validate required fields
    if (!username || !password || !role) {
      throw new Error("Missing required fields: username, password, role");
    }

    const hashedPassword = await this.hashPassword(password);

    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
      db.query(sql, [username, hashedPassword, role], (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          username,
          role,
          message: "User berhasil dibuat",
        });
      });
    });
  }

  /**
   * Get all user logs
   * @returns {Promise<Array>} Array of user logs
   */
  static async getAllUserLogs() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT id, username, role, last_login, last_ip FROM users";
      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Extract IP address from request
   * @param {object} req - Express request object
   * @returns {string} IP address
   */
  static extractIpAddress(req) {
    return (
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown"
    );
  }

  /**
   * Authenticate user with username and password
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @param {string} ipAddress - User's IP address
   * @returns {Promise<object>} Authentication result with token and role
   */
  static async authenticateUser(username, password, ipAddress) {
    // Find user by username
    const user = await this.findByUsername(username);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Password salah");
    }

    // Update login information
    await this.updateLoginInfo(user.id, ipAddress);

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }
}
