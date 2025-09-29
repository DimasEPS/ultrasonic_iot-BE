# Backend Models - Business Logic Layer

## 📁 Model Architecture

```
backend/src/
├── models/
│   ├── index.js           # Models export hub
│   ├── User.model.js      # User authentication & management
│   ├── Distance.model.js  # Distance sensor data handling
│   └── Control.model.js   # Device control logic
├── controllers/
│   ├── auth.controller.js     # User endpoints (now uses UserModel)
│   ├── distance.controller.js # Distance endpoints (now uses DistanceModel)
│   └── switch.controller.js   # Control endpoints (now uses ControlModel)
└── routes/
    ├── auth.js
    ├── distance.js
    └── control.js
```

## 🏗️ Separation of Concerns

### **Before (Monolithic Controllers):**

```javascript
// Controllers contained both HTTP handling AND business logic
export const authController = {
  login: async (req, res) => {
    // HTTP handling + Database queries + Business logic + Validation
    const sql = "SELECT * FROM users WHERE username=?";
    db.query(sql, [username], async (err, results) => {
      // ... complex business logic mixed with HTTP response
    });
  },
};
```

### **After (Clean Architecture):**

```javascript
// Controllers: Pure HTTP handling
export const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const ipAddress = UserModel.extractIpAddress(req);
      const authResult = await UserModel.authenticateUser(
        username,
        password,
        ipAddress
      );
      res.json(authResult);
    } catch (error) {
      // Error handling
    }
  },
};

// Models: Pure business logic
export class UserModel {
  static async authenticateUser(username, password, ipAddress) {
    // All business logic encapsulated here
  }
}
```

## 🧩 Model Details

### 📋 **UserModel** (`User.model.js`)

**Responsibilities:**

- User authentication and authorization
- Password hashing and verification
- JWT token generation
- User CRUD operations
- Login history tracking

**Key Methods:**

- `authenticateUser(username, password, ipAddress)` - Complete authentication flow
- `findByUsername(username)` - Find user by username
- `verifyPassword(plain, hashed)` - Password verification
- `generateToken(user)` - JWT token creation
- `createUser(userData)` - User registration
- `getAllUserLogs()` - Get user activity logs

### 📏 **DistanceModel** (`Distance.model.js`)

**Responsibilities:**

- Distance sensor data validation
- CRUD operations for sensor data
- Data statistics and analytics
- Data cleanup and maintenance

**Key Methods:**

- `getDistanceData(sensorType, limit)` - Retrieve sensor data
- `insertDistanceData(sensorType, data)` - Add new sensor reading
- `getAllDistanceData(limit)` - Combined sensor data
- `getLatestReading(sensorType)` - Most recent reading
- `getDistanceStatistics(sensorType, hours)` - Analytics
- `validateDistanceData(data)` - Input validation

### 🎛️ **ControlModel** (`Control.model.js`)

**Responsibilities:**

- Device control state management
- Control validation and sanitization
- Device status tracking
- Control history (future feature)

**Key Methods:**

- `getControlStatus()` - Current device states
- `updateControlStatus(controlData)` - Update device control
- `toggleTVStatus()` - Toggle TV on/off
- `getDeviceStatusSummary()` - Device overview
- `validateControlData(data)` - Input validation
- `sanitizeControlValue(value)` - Value sanitization

## ✅ Benefits of Model Layer

### **🔧 Maintainability:**

- **Single Responsibility**: Each model handles one domain
- **Business Logic Isolation**: Logic separated from HTTP concerns
- **Easy Testing**: Models can be unit tested independently
- **Code Reusability**: Models can be used across different controllers

### **🔒 Data Integrity:**

- **Centralized Validation**: All validation logic in models
- **Consistent Rules**: Same validation rules across endpoints
- **Error Handling**: Standardized error messages and handling
- **Type Safety**: Proper data type validation and conversion

### **🚀 Scalability:**

- **Service Layer Ready**: Easy to add service layer later
- **Database Abstraction**: Database logic encapsulated
- **Easy Refactoring**: Change implementation without affecting controllers
- **Feature Addition**: Add new methods without controller changes

### **📊 Performance:**

- **Query Optimization**: Database queries optimized in models
- **Caching Ready**: Easy to add caching layer in models
- **Connection Pooling**: Database connections managed centrally
- **Resource Management**: Proper resource cleanup

## 🎯 Usage Examples

### **In Controllers (HTTP Layer):**

```javascript
import { UserModel } from "../models/User.model.js";

export const authController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const ipAddress = UserModel.extractIpAddress(req);
      const result = await UserModel.authenticateUser(
        username,
        password,
        ipAddress
      );
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  },
};
```

### **In Services (Business Layer - Future):**

```javascript
import { DistanceModel, ControlModel } from "../models/index.js";

export class AutomationService {
  static async autoControlBasedOnDistance() {
    const latestDistance = await DistanceModel.getLatestReading("1");
    if (latestDistance.distances < 10) {
      await ControlModel.updateControlStatus({ TV: 1 });
    }
  }
}
```

### **Direct Model Usage:**

```javascript
import { Models } from "../models/index.js";

// Get statistics
const stats = await Models.Distance.getDistanceStatistics("1", 24);

// Create user
const user = await Models.User.createUser({
  username: "admin",
  password: "password123",
  role: "super-admin",
});

// Toggle device
const result = await Models.Control.toggleTVStatus();
```

## 🔄 Migration Summary

### **Controllers Refactored:**

- ✅ **AuthController**: Now uses UserModel for all user operations
- ✅ **DistanceController**: Uses DistanceModel with enhanced features
- ✅ **ControlController**: Uses ControlModel with additional functionality

### **New Features Added:**

- **Enhanced Validation**: Comprehensive input validation
- **Better Error Handling**: Consistent error messages and HTTP status codes
- **Statistics Endpoints**: Distance sensor analytics
- **Device Management**: Enhanced control operations
- **Development Mode**: Detailed errors in development environment

### **Backward Compatibility:**

- ✅ All existing API endpoints work exactly the same
- ✅ Same request/response formats
- ✅ No breaking changes for frontend
- ✅ Enhanced functionality is additive

## 🛠️ Development Guidelines

### **Adding New Models:**

1. Create model class in `/models/` directory
2. Follow naming convention: `EntityName.model.js`
3. Export class and add to `models/index.js`
4. Use static methods for model operations
5. Handle validation and business logic in model

### **Model Best Practices:**

- **Static Methods**: Use static methods for model operations
- **Error Handling**: Throw descriptive errors for business logic failures
- **Validation**: Validate all inputs in model methods
- **Promises**: Use Promises for all async operations
- **Documentation**: Document all public methods

### **Controller Best Practices:**

- **Thin Controllers**: Keep controllers focused on HTTP concerns
- **Error Mapping**: Map model errors to appropriate HTTP status codes
- **Input Extraction**: Extract and validate HTTP inputs
- **Response Formatting**: Format model results for HTTP responses

## 📈 Performance Considerations

- **Database Queries**: Optimized queries with proper indexes
- **Connection Management**: Efficient database connection usage
- **Memory Management**: Proper cleanup of resources
- **Caching Ready**: Structure prepared for caching implementation
- **Pagination**: Built-in limit support for large datasets

This model architecture provides a solid foundation for scalable, maintainable, and testable backend code while preserving all existing functionality.
