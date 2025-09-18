"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportFormat = exports.ExportFormat = exports.HealthStatus = exports.BulkOperationType = exports.SortOrder = void 0;
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var BulkOperationType;
(function (BulkOperationType) {
    BulkOperationType["CREATE"] = "create";
    BulkOperationType["UPDATE"] = "update";
    BulkOperationType["DELETE"] = "delete";
    BulkOperationType["UPSERT"] = "upsert";
})(BulkOperationType || (exports.BulkOperationType = BulkOperationType = {}));
var HealthStatus;
(function (HealthStatus) {
    HealthStatus["HEALTHY"] = "healthy";
    HealthStatus["DEGRADED"] = "degraded";
    HealthStatus["UNHEALTHY"] = "unhealthy";
})(HealthStatus || (exports.HealthStatus = HealthStatus = {}));
var ExportFormat;
(function (ExportFormat) {
    ExportFormat["CSV"] = "csv";
    ExportFormat["JSON"] = "json";
    ExportFormat["XLSX"] = "xlsx";
    ExportFormat["PDF"] = "pdf";
    ExportFormat["XML"] = "xml";
})(ExportFormat || (exports.ExportFormat = ExportFormat = {}));
var ImportFormat;
(function (ImportFormat) {
    ImportFormat["CSV"] = "csv";
    ImportFormat["JSON"] = "json";
    ImportFormat["XLSX"] = "xlsx";
    ImportFormat["XML"] = "xml";
})(ImportFormat || (exports.ImportFormat = ImportFormat = {}));
//# sourceMappingURL=api.js.map