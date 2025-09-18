"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemperatureUnit = exports.RobotStatus = exports.RobotCapability = exports.RobotVendor = exports.DefaultVendorRegistry = exports.BaseVendorAdapter = exports.VendorEventType = exports.ConnectionStatus = exports.AuthenticationType = exports.ConnectionProtocol = void 0;
var ConnectionProtocol;
(function (ConnectionProtocol) {
    ConnectionProtocol["TCP"] = "tcp";
    ConnectionProtocol["UDP"] = "udp";
    ConnectionProtocol["HTTP"] = "http";
    ConnectionProtocol["HTTPS"] = "https";
    ConnectionProtocol["WEBSOCKET"] = "websocket";
    ConnectionProtocol["MODBUS"] = "modbus";
    ConnectionProtocol["PROFINET"] = "profinet";
    ConnectionProtocol["ETHERNET_IP"] = "ethernet_ip";
    ConnectionProtocol["OPC_UA"] = "opc_ua";
    ConnectionProtocol["CUSTOM"] = "custom";
})(ConnectionProtocol || (exports.ConnectionProtocol = ConnectionProtocol = {}));
var AuthenticationType;
(function (AuthenticationType) {
    AuthenticationType["NONE"] = "none";
    AuthenticationType["BASIC"] = "basic";
    AuthenticationType["DIGEST"] = "digest";
    AuthenticationType["OAUTH2"] = "oauth2";
    AuthenticationType["API_KEY"] = "api_key";
    AuthenticationType["CERTIFICATE"] = "certificate";
    AuthenticationType["CUSTOM"] = "custom";
})(AuthenticationType || (exports.AuthenticationType = AuthenticationType = {}));
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus["CONNECTED"] = "connected";
    ConnectionStatus["DISCONNECTED"] = "disconnected";
    ConnectionStatus["CONNECTING"] = "connecting";
    ConnectionStatus["RECONNECTING"] = "reconnecting";
    ConnectionStatus["ERROR"] = "error";
    ConnectionStatus["TIMEOUT"] = "timeout";
})(ConnectionStatus || (exports.ConnectionStatus = ConnectionStatus = {}));
var VendorEventType;
(function (VendorEventType) {
    VendorEventType["STATUS_CHANGED"] = "status_changed";
    VendorEventType["POSITION_CHANGED"] = "position_changed";
    VendorEventType["PROGRAM_STARTED"] = "program_started";
    VendorEventType["PROGRAM_STOPPED"] = "program_stopped";
    VendorEventType["PROGRAM_PAUSED"] = "program_paused";
    VendorEventType["PROGRAM_RESUMED"] = "program_resumed";
    VendorEventType["ERROR_OCCURRED"] = "error_occurred";
    VendorEventType["WARNING_ISSUED"] = "warning_issued";
    VendorEventType["EMERGENCY_STOP"] = "emergency_stop";
    VendorEventType["SAFETY_VIOLATION"] = "safety_violation";
    VendorEventType["TOOL_CHANGED"] = "tool_changed";
    VendorEventType["SPEED_CHANGED"] = "speed_changed";
    VendorEventType["MODE_CHANGED"] = "mode_changed";
    VendorEventType["CALIBRATION_REQUIRED"] = "calibration_required";
    VendorEventType["MAINTENANCE_DUE"] = "maintenance_due";
})(VendorEventType || (exports.VendorEventType = VendorEventType = {}));
class BaseVendorAdapter {
    createConnection(config) {
        return {
            id: this.generateConnectionId(),
            vendor: this.vendor,
            robotId: '', // Will be set after connection
            status: ConnectionStatus.CONNECTING,
            config,
            connectedAt: new Date(),
            metrics: {
                uptime: 0,
                messagesReceived: 0,
                messagesSent: 0,
                bytesReceived: 0,
                bytesSent: 0,
                averageLatency: 0,
                errorCount: 0,
            },
        };
    }
    generateConnectionId() {
        return `${this.vendor}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    validateConfig(config) {
        const errors = [];
        const warnings = [];
        if (!config.host) {
            errors.push({
                field: 'host',
                message: 'Host is required',
                code: 'REQUIRED_FIELD',
            });
        }
        if (!config.port || config.port < 1 || config.port > 65535) {
            errors.push({
                field: 'port',
                message: 'Port must be between 1 and 65535',
                code: 'INVALID_PORT',
            });
        }
        if (config.timeout && config.timeout < 1000) {
            warnings.push({
                field: 'timeout',
                message: 'Timeout less than 1 second may cause connection issues',
                code: 'LOW_TIMEOUT',
            });
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
exports.BaseVendorAdapter = BaseVendorAdapter;
class DefaultVendorRegistry {
    adapters = new Map();
    register(adapter) {
        this.adapters.set(adapter.vendor, adapter);
    }
    unregister(vendor) {
        this.adapters.delete(vendor);
    }
    get(vendor) {
        return this.adapters.get(vendor);
    }
    list() {
        return Array.from(this.adapters.values());
    }
    isSupported(vendor) {
        return this.adapters.has(vendor);
    }
}
exports.DefaultVendorRegistry = DefaultVendorRegistry;
// Re-export types for convenience
var robot_1 = require("./robot");
Object.defineProperty(exports, "RobotVendor", { enumerable: true, get: function () { return robot_1.RobotVendor; } });
Object.defineProperty(exports, "RobotCapability", { enumerable: true, get: function () { return robot_1.RobotCapability; } });
Object.defineProperty(exports, "RobotStatus", { enumerable: true, get: function () { return robot_1.RobotStatus; } });
var telemetry_1 = require("./telemetry");
Object.defineProperty(exports, "TemperatureUnit", { enumerable: true, get: function () { return telemetry_1.TemperatureUnit; } });
//# sourceMappingURL=vendor.js.map