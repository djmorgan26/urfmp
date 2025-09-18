export interface MaintenanceTask {
    id: string;
    robotId: string;
    organizationId: string;
    type: MaintenanceType;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    title: string;
    description: string;
    instructions?: string[];
    estimatedDuration: number;
    actualDuration?: number;
    scheduledAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    dueDate: Date;
    assignedTo?: string;
    createdBy: string;
    parts: MaintenancePart[];
    checklistItems: ChecklistItem[];
    attachments: MaintenanceAttachment[];
    notes: MaintenanceNote[];
    cost?: MaintenanceCost;
    tags: string[];
    isRecurring: boolean;
    recurrenceRule?: RecurrenceRule;
    parentTaskId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum MaintenanceType {
    PREVENTIVE = "preventive",
    CORRECTIVE = "corrective",
    PREDICTIVE = "predictive",
    CONDITION_BASED = "condition_based",
    EMERGENCY = "emergency",
    CALIBRATION = "calibration",
    INSPECTION = "inspection",
    CLEANING = "cleaning",
    LUBRICATION = "lubrication",
    REPLACEMENT = "replacement",
    UPGRADE = "upgrade",
    CUSTOM = "custom"
}
export declare enum MaintenancePriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export declare enum MaintenanceStatus {
    SCHEDULED = "scheduled",
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    OVERDUE = "overdue",
    ON_HOLD = "on_hold",
    REQUIRES_APPROVAL = "requires_approval"
}
export interface MaintenancePart {
    id: string;
    name: string;
    partNumber: string;
    manufacturer?: string;
    quantity: number;
    unitCost?: number;
    totalCost?: number;
    inStock: boolean;
    supplier?: string;
    leadTime?: number;
    specifications?: Record<string, any>;
}
export interface ChecklistItem {
    id: string;
    description: string;
    required: boolean;
    completed: boolean;
    completedAt?: Date;
    completedBy?: string;
    notes?: string;
    attachments?: string[];
    order: number;
}
export interface MaintenanceAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedBy: string;
    uploadedAt: Date;
    description?: string;
}
export interface MaintenanceNote {
    id: string;
    content: string;
    author: string;
    authorName: string;
    createdAt: Date;
    isPrivate: boolean;
    attachments?: string[];
}
export interface MaintenanceCost {
    labor: number;
    parts: number;
    external: number;
    total: number;
    currency: string;
    estimatedTotal?: number;
}
export interface RecurrenceRule {
    frequency: RecurrenceFrequency;
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
    endDate?: Date;
    maxOccurrences?: number;
}
export declare enum RecurrenceFrequency {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly",
    HOURS = "hours",// Based on operating hours
    CYCLES = "cycles",// Based on operation cycles
    DISTANCE = "distance",// Based on distance traveled
    CUSTOM = "custom"
}
export interface MaintenanceSchedule {
    id: string;
    robotId: string;
    organizationId: string;
    name: string;
    description?: string;
    type: MaintenanceType;
    template: MaintenanceTemplate;
    recurrenceRule: RecurrenceRule;
    isActive: boolean;
    nextDueDate: Date;
    lastCompletedAt?: Date;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface MaintenanceTemplate {
    id: string;
    name: string;
    description?: string;
    type: MaintenanceType;
    estimatedDuration: number;
    instructions: string[];
    checklistItems: TemplateChecklistItem[];
    requiredParts: TemplatePart[];
    requiredSkills: string[];
    safetyProcedures: string[];
    tools: string[];
    isPublic: boolean;
    organizationId?: string;
    createdBy: string;
    tags: string[];
    version: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface TemplateChecklistItem {
    description: string;
    required: boolean;
    instructions?: string;
    estimatedTime?: number;
    order: number;
}
export interface TemplatePart {
    name: string;
    partNumber?: string;
    quantity: number;
    estimatedCost?: number;
    critical: boolean;
    alternatives?: string[];
}
export interface MaintenancePrediction {
    id: string;
    robotId: string;
    organizationId: string;
    component: RobotComponent;
    predictionType: PredictionType;
    severity: PredictionSeverity;
    confidence: number;
    predictedFailureDate: Date;
    remainingUsefulLife: number;
    triggerMetrics: TriggerMetric[];
    recommendation: MaintenanceRecommendation;
    modelVersion: string;
    createdAt: Date;
    acknowledgedAt?: Date;
    acknowledgedBy?: string;
}
export declare enum RobotComponent {
    MOTOR_JOINT_1 = "motor_joint_1",
    MOTOR_JOINT_2 = "motor_joint_2",
    MOTOR_JOINT_3 = "motor_joint_3",
    MOTOR_JOINT_4 = "motor_joint_4",
    MOTOR_JOINT_5 = "motor_joint_5",
    MOTOR_JOINT_6 = "motor_joint_6",
    MOTOR_JOINT_7 = "motor_joint_7",
    GEARBOX_1 = "gearbox_1",
    GEARBOX_2 = "gearbox_2",
    GEARBOX_3 = "gearbox_3",
    GEARBOX_4 = "gearbox_4",
    GEARBOX_5 = "gearbox_5",
    GEARBOX_6 = "gearbox_6",
    BEARING_1 = "bearing_1",
    BEARING_2 = "bearing_2",
    BEARING_3 = "bearing_3",
    BEARING_4 = "bearing_4",
    BEARING_5 = "bearing_5",
    BEARING_6 = "bearing_6",
    CONTROLLER = "controller",
    POWER_SUPPLY = "power_supply",
    BRAKE_SYSTEM = "brake_system",
    COOLING_SYSTEM = "cooling_system",
    PNEUMATIC_SYSTEM = "pneumatic_system",
    HYDRAULIC_SYSTEM = "hydraulic_system",
    TOOL_CHANGER = "tool_changer",
    END_EFFECTOR = "end_effector",
    CABLES = "cables",
    SENSORS = "sensors",
    SAFETY_SYSTEM = "safety_system",
    CUSTOM = "custom"
}
export declare enum PredictionType {
    WEAR = "wear",
    FATIGUE = "fatigue",
    OVERHEATING = "overheating",
    VIBRATION = "vibration",
    PERFORMANCE_DEGRADATION = "performance_degradation",
    CALIBRATION_DRIFT = "calibration_drift",
    LUBRICATION = "lubrication",
    CONTAMINATION = "contamination",
    ELECTRICAL_FAULT = "electrical_fault",
    MECHANICAL_FAULT = "mechanical_fault"
}
export declare enum PredictionSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
export interface TriggerMetric {
    name: string;
    value: number;
    threshold: number;
    unit: string;
    trend: TrendDirection;
    importance: number;
}
export declare enum TrendDirection {
    INCREASING = "increasing",
    DECREASING = "decreasing",
    STABLE = "stable",
    VOLATILE = "volatile"
}
export interface MaintenanceRecommendation {
    action: RecommendedAction;
    priority: MaintenancePriority;
    timeframe: string;
    description: string;
    estimatedCost?: number;
    estimatedDowntime?: number;
    alternatives?: AlternativeRecommendation[];
}
export declare enum RecommendedAction {
    INSPECT = "inspect",
    REPLACE = "replace",
    REPAIR = "repair",
    CALIBRATE = "calibrate",
    LUBRICATE = "lubricate",
    CLEAN = "clean",
    ADJUST = "adjust",
    MONITOR = "monitor",
    SCHEDULE_MAINTENANCE = "schedule_maintenance",
    IMMEDIATE_SHUTDOWN = "immediate_shutdown"
}
export interface AlternativeRecommendation {
    action: RecommendedAction;
    description: string;
    estimatedCost?: number;
    pros: string[];
    cons: string[];
}
export interface MaintenanceReport {
    id: string;
    organizationId: string;
    title: string;
    type: ReportType;
    period: ReportPeriod;
    filters: MaintenanceReportFilters;
    data: MaintenanceReportData;
    generatedAt: Date;
    generatedBy: string;
    format: ReportFormat;
    url?: string;
}
export declare enum ReportType {
    SUMMARY = "summary",
    DETAILED = "detailed",
    PREDICTIVE = "predictive",
    COST_ANALYSIS = "cost_analysis",
    PERFORMANCE = "performance",
    COMPLIANCE = "compliance"
}
export declare enum ReportPeriod {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    QUARTERLY = "quarterly",
    YEARLY = "yearly",
    CUSTOM = "custom"
}
export interface MaintenanceReportFilters {
    robotIds?: string[];
    types?: MaintenanceType[];
    priorities?: MaintenancePriority[];
    statuses?: MaintenanceStatus[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    assignedTo?: string[];
    tags?: string[];
}
export interface MaintenanceReportData {
    summary: MaintenanceSummary;
    tasks: MaintenanceTask[];
    predictions?: MaintenancePrediction[];
    costs?: CostBreakdown;
    trends?: TrendData[];
    charts?: ChartData[];
}
export interface MaintenanceSummary {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    avgCompletionTime: number;
    totalCost: number;
    totalDowntime: number;
    mtbf: number;
    mttr: number;
    availability: number;
}
export interface CostBreakdown {
    labor: number;
    parts: number;
    external: number;
    total: number;
    currency: string;
    byType: Record<MaintenanceType, number>;
    byRobot: Record<string, number>;
    byMonth: Record<string, number>;
}
export interface TrendData {
    metric: string;
    values: Array<{
        date: Date;
        value: number;
    }>;
    trend: TrendDirection;
    change: number;
}
export interface ChartData {
    type: ChartType;
    title: string;
    data: any;
    config: Record<string, any>;
}
export declare enum ChartType {
    LINE = "line",
    BAR = "bar",
    PIE = "pie",
    SCATTER = "scatter",
    AREA = "area",
    HISTOGRAM = "histogram"
}
export declare enum ReportFormat {
    PDF = "pdf",
    XLSX = "xlsx",
    CSV = "csv",
    JSON = "json",
    HTML = "html"
}
export interface MaintenanceMetrics {
    robotId: string;
    organizationId: string;
    period: string;
    mtbf: number;
    mttr: number;
    mttf: number;
    availability: number;
    reliability: number;
    oee: number;
    plannedMaintenanceRatio: number;
    maintenanceCostRatio: number;
    complianceScore: number;
    predictiveAccuracy?: number;
    calculatedAt: Date;
}
//# sourceMappingURL=maintenance.d.ts.map