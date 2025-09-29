/**
 * Models Index
 * Central export for all model classes
 */

export { UserModel } from "./User.model.js";
export { DistanceModel } from "./Distance.model.js";
export { ControlModel } from "./Control.model.js";

// Optional: Export all models as a single object
export const Models = {
  User: UserModel,
  Distance: DistanceModel,
  Control: ControlModel,
};
