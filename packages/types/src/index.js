"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandConfig = exports.defaultBrandConfig = exports.HealthStatus = exports.SortOrder = exports.VelocityUnit = exports.TorqueUnit = exports.TemperatureUnit = exports.ForceUnit = exports.AngleUnit = void 0;
// Robot types
__exportStar(require("./robot"), exports);
var telemetry_1 = require("./telemetry");
Object.defineProperty(exports, "AngleUnit", { enumerable: true, get: function () { return telemetry_1.AngleUnit; } });
Object.defineProperty(exports, "ForceUnit", { enumerable: true, get: function () { return telemetry_1.ForceUnit; } });
Object.defineProperty(exports, "TemperatureUnit", { enumerable: true, get: function () { return telemetry_1.TemperatureUnit; } });
Object.defineProperty(exports, "TorqueUnit", { enumerable: true, get: function () { return telemetry_1.TorqueUnit; } });
Object.defineProperty(exports, "VelocityUnit", { enumerable: true, get: function () { return telemetry_1.VelocityUnit; } });
// Organization types
__exportStar(require("./organization"), exports);
// User types
__exportStar(require("./user"), exports);
// Auth types
__exportStar(require("./auth"), exports);
var api_1 = require("./api");
Object.defineProperty(exports, "SortOrder", { enumerable: true, get: function () { return api_1.SortOrder; } });
Object.defineProperty(exports, "HealthStatus", { enumerable: true, get: function () { return api_1.HealthStatus; } });
// WebSocket types
__exportStar(require("./websocket"), exports);
// Event types
__exportStar(require("./events"), exports);
// Vendor types
__exportStar(require("./vendor"), exports);
// Maintenance types
__exportStar(require("./maintenance"), exports);
var brand_1 = require("./config/brand");
Object.defineProperty(exports, "defaultBrandConfig", { enumerable: true, get: function () { return brand_1.defaultBrandConfig; } });
Object.defineProperty(exports, "getBrandConfig", { enumerable: true, get: function () { return brand_1.getBrandConfig; } });
//# sourceMappingURL=index.js.map