import { db } from "../../server.js";

/**
 * Distance Model
 * Handles all distance sensor data operations and business logic
 */
export class DistanceModel {
  /**
   * Validate distance data
   * @param {object} data - Distance data {distances, status}
   * @throws {Error} If validation fails
   */
  static validateDistanceData(data) {
    const { distances, status } = data;

    // Check required fields
    if (distances === undefined || status === undefined) {
      throw new Error("Missing required fields: distances and status");
    }

    // Validate data types
    if (typeof distances !== "number") {
      throw new Error("distances must be a number");
    }

    if (typeof status !== "string") {
      throw new Error("status must be a string");
    }

    // Validate ranges
    if (distances < 0) {
      throw new Error("distances must be a positive number");
    }

    // Validate status values
    const validStatuses = ["online", "offline", "1", "0", "true", "false"];
    if (!validStatuses.includes(status.toLowerCase())) {
      throw new Error(
        "status must be one of: online, offline, 1, 0, true, false"
      );
    }
  }

  /**
   * Get distance data from specified sensor
   * @param {string} sensorType - Sensor type ('1' or '2')
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Distance data array
   */
  static async getDistanceData(sensorType, limit = 20) {
    return new Promise((resolve, reject) => {
      const tableName = `distance${sensorType}`;
      const sql = `SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT ?`;

      db.query(sql, [limit], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Insert new distance data
   * @param {string} sensorType - Sensor type ('1' or '2')
   * @param {object} data - Distance data {distances, status}
   * @returns {Promise<object>} Insert result
   */
  static async insertDistanceData(sensorType, data) {
    // Validate input data
    this.validateDistanceData(data);

    const { distances, status } = data;
    const tableName = `distance${sensorType}`;

    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO ${tableName} (distances, status, timestamp) VALUES (?, ?, NOW())`;

      db.query(sql, [distances, status], (err, result) => {
        if (err) return reject(err);

        resolve({
          message: `Distance${sensorType} data inserted successfully`,
          id: result.insertId,
          distances: distances,
          status: status,
          timestamp: new Date().toISOString(),
          sensorType: sensorType,
        });
      });
    });
  }

  /**
   * Get combined distance data from both sensors
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Combined distance data
   */
  static async getAllDistanceData(limit = 10) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 'distance1' AS source, id, distances, status, timestamp FROM distance1
        UNION ALL
        SELECT 'distance2' AS source, id, distances, status, timestamp FROM distance2
        ORDER BY timestamp DESC LIMIT ?
      `;

      db.query(sql, [limit], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Get latest distance reading from specific sensor
   * @param {string} sensorType - Sensor type ('1' or '2')
   * @returns {Promise<object|null>} Latest distance reading
   */
  static async getLatestReading(sensorType) {
    return new Promise((resolve, reject) => {
      const tableName = `distance${sensorType}`;
      const sql = `SELECT * FROM ${tableName} ORDER BY timestamp DESC LIMIT 1`;

      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results.length > 0 ? results[0] : null);
      });
    });
  }

  /**
   * Get distance statistics for specific sensor
   * @param {string} sensorType - Sensor type ('1' or '2')
   * @param {number} hours - Number of hours to analyze (default: 24)
   * @returns {Promise<object>} Distance statistics
   */
  static async getDistanceStatistics(sensorType, hours = 24) {
    return new Promise((resolve, reject) => {
      const tableName = `distance${sensorType}`;
      const sql = `
        SELECT 
          COUNT(*) as total_readings,
          AVG(distances) as avg_distance,
          MIN(distances) as min_distance,
          MAX(distances) as max_distance,
          SUM(CASE WHEN status = 'online' OR status = '1' THEN 1 ELSE 0 END) as online_count,
          SUM(CASE WHEN status = 'offline' OR status = '0' THEN 1 ELSE 0 END) as offline_count
        FROM ${tableName} 
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      `;

      db.query(sql, [hours], (err, results) => {
        if (err) return reject(err);

        const stats = results[0];
        resolve({
          sensor: sensorType,
          period_hours: hours,
          total_readings: stats.total_readings || 0,
          avg_distance: parseFloat(stats.avg_distance) || 0,
          min_distance: stats.min_distance || 0,
          max_distance: stats.max_distance || 0,
          online_percentage:
            stats.total_readings > 0
              ? ((stats.online_count / stats.total_readings) * 100).toFixed(2)
              : 0,
          offline_percentage:
            stats.total_readings > 0
              ? ((stats.offline_count / stats.total_readings) * 100).toFixed(2)
              : 0,
        });
      });
    });
  }

  /**
   * Delete old distance data
   * @param {string} sensorType - Sensor type ('1' or '2')
   * @param {number} days - Keep data newer than this many days
   * @returns {Promise<object>} Deletion result
   */
  static async cleanupOldData(sensorType, days = 30) {
    return new Promise((resolve, reject) => {
      const tableName = `distance${sensorType}`;
      const sql = `DELETE FROM ${tableName} WHERE timestamp < DATE_SUB(NOW(), INTERVAL ? DAY)`;

      db.query(sql, [days], (err, result) => {
        if (err) return reject(err);

        resolve({
          message: `Cleaned up old data from ${tableName}`,
          deleted_records: result.affectedRows,
          sensor: sensorType,
          days_kept: days,
        });
      });
    });
  }
}
