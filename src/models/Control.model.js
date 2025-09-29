import { db } from "../../server.js";

/**
 * Control Model
 * Handles all device control operations and business logic
 */
export class ControlModel {
  /**
   * Validate control data
   * @param {object} data - Control data
   * @throws {Error} If validation fails
   */
  static validateControlData(data) {
    const { TV } = data;

    if (TV === undefined) {
      throw new Error("TV control value is required");
    }

    // Validate TV value (should be 0 or 1)
    if (![0, 1, "0", "1", true, false].includes(TV)) {
      throw new Error("TV value must be 0, 1, true, or false");
    }
  }

  /**
   * Get current control status
   * @returns {Promise<object>} Control status
   */
  static async getControlStatus() {
    return new Promise((resolve, reject) => {
      const sql = "SELECT TV FROM switch_condition WHERE id=1";

      db.query(sql, (err, results) => {
        if (err) return reject(err);

        if (results.length === 0) {
          // If no record exists, create default one
          this.initializeControlStatus()
            .then(() => {
              resolve({ TV: 0 });
            })
            .catch(reject);
        } else {
          resolve(results[0]);
        }
      });
    });
  }

  /**
   * Update control status
   * @param {object} controlData - Control data {TV}
   * @returns {Promise<object>} Update result
   */
  static async updateControlStatus(controlData) {
    // Validate input data
    this.validateControlData(controlData);

    const { TV } = controlData;

    // Convert boolean to integer if needed
    const tvValue = TV === true || TV === "1" ? 1 : 0;

    return new Promise((resolve, reject) => {
      // First check if record exists
      this.getControlStatus()
        .then(() => {
          const sql =
            "UPDATE switch_condition SET TV=?, updated_at=NOW() WHERE id=1";

          db.query(sql, [tvValue], (err, result) => {
            if (err) return reject(err);

            resolve({
              message: "TV control updated successfully",
              TV: tvValue,
              updated_at: new Date().toISOString(),
              affected_rows: result.affectedRows,
            });
          });
        })
        .catch(reject);
    });
  }

  /**
   * Initialize control status if not exists
   * @returns {Promise<object>} Initialization result
   */
  static async initializeControlStatus() {
    return new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO switch_condition (id, TV, created_at, updated_at) VALUES (1, 0, NOW(), NOW()) ON DUPLICATE KEY UPDATE updated_at=NOW()";

      db.query(sql, (err, result) => {
        if (err) return reject(err);

        resolve({
          message: "Control status initialized",
          TV: 0,
          initialized: true,
        });
      });
    });
  }

  /**
   * Get control history
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>} Control history
   */
  static async getControlHistory(limit = 50) {
    return new Promise((resolve, reject) => {
      // This would require a control_history table to track changes
      // For now, we'll return current status with timestamp
      const sql = "SELECT TV, updated_at FROM switch_condition WHERE id=1";

      db.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  /**
   * Toggle TV control status
   * @returns {Promise<object>} Toggle result
   */
  static async toggleTVStatus() {
    try {
      const currentStatus = await this.getControlStatus();
      const newTVValue = currentStatus.TV === 1 ? 0 : 1;

      const result = await this.updateControlStatus({ TV: newTVValue });

      return {
        ...result,
        message: `TV ${newTVValue === 1 ? "turned ON" : "turned OFF"}`,
        previous_value: currentStatus.TV,
        new_value: newTVValue,
      };
    } catch (error) {
      throw new Error(`Failed to toggle TV status: ${error.message}`);
    }
  }

  /**
   * Get device status summary
   * @returns {Promise<object>} Device status summary
   */
  static async getDeviceStatusSummary() {
    try {
      const controlStatus = await this.getControlStatus();

      return {
        devices: {
          TV: {
            status: controlStatus.TV === 1 ? "ON" : "OFF",
            value: controlStatus.TV,
            last_updated: controlStatus.updated_at || null,
          },
        },
        total_devices: 1,
        active_devices: controlStatus.TV === 1 ? 1 : 0,
        summary: `${
          controlStatus.TV === 1 ? 1 : 0
        } of 1 devices are currently ON`,
      };
    } catch (error) {
      throw new Error(`Failed to get device status summary: ${error.message}`);
    }
  }

  /**
   * Validate and sanitize control input
   * @param {any} value - Input value to sanitize
   * @returns {number} Sanitized value (0 or 1)
   */
  static sanitizeControlValue(value) {
    if (value === true || value === "true" || value === "1" || value === 1) {
      return 1;
    } else if (
      value === false ||
      value === "false" ||
      value === "0" ||
      value === 0
    ) {
      return 0;
    } else {
      throw new Error("Invalid control value. Must be boolean, 0, or 1");
    }
  }
}
