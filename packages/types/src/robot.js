'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.CommandStatus =
  exports.CommandPriority =
  exports.RobotCommandType =
  exports.RobotCapability =
  exports.RobotStatus =
  exports.RobotVendor =
    void 0
var RobotVendor
;(function (RobotVendor) {
  RobotVendor['UNIVERSAL_ROBOTS'] = 'universal_robots'
  RobotVendor['KUKA'] = 'kuka'
  RobotVendor['ABB'] = 'abb'
  RobotVendor['FANUC'] = 'fanuc'
  RobotVendor['YASKAWA'] = 'yaskawa'
  RobotVendor['DOOSAN'] = 'doosan'
  RobotVendor['TECHMAN'] = 'techman'
  RobotVendor['CUSTOM'] = 'custom'
})(RobotVendor || (exports.RobotVendor = RobotVendor = {}))
var RobotStatus
;(function (RobotStatus) {
  RobotStatus['ONLINE'] = 'online'
  RobotStatus['OFFLINE'] = 'offline'
  RobotStatus['ERROR'] = 'error'
  RobotStatus['MAINTENANCE'] = 'maintenance'
  RobotStatus['RUNNING'] = 'running'
  RobotStatus['IDLE'] = 'idle'
  RobotStatus['STOPPED'] = 'stopped'
  RobotStatus['EMERGENCY_STOP'] = 'emergency_stop'
})(RobotStatus || (exports.RobotStatus = RobotStatus = {}))
var RobotCapability
;(function (RobotCapability) {
  RobotCapability['WELDING'] = 'welding'
  RobotCapability['PAINTING'] = 'painting'
  RobotCapability['ASSEMBLY'] = 'assembly'
  RobotCapability['MATERIAL_HANDLING'] = 'material_handling'
  RobotCapability['MACHINE_TENDING'] = 'machine_tending'
  RobotCapability['PACKAGING'] = 'packaging'
  RobotCapability['PALLETIZING'] = 'palletizing'
  RobotCapability['INSPECTION'] = 'inspection'
  RobotCapability['CUSTOM'] = 'custom'
})(RobotCapability || (exports.RobotCapability = RobotCapability = {}))
var RobotCommandType
;(function (RobotCommandType) {
  RobotCommandType['START'] = 'start'
  RobotCommandType['STOP'] = 'stop'
  RobotCommandType['PAUSE'] = 'pause'
  RobotCommandType['RESUME'] = 'resume'
  RobotCommandType['EMERGENCY_STOP'] = 'emergency_stop'
  RobotCommandType['RESET'] = 'reset'
  RobotCommandType['MOVE_TO_POSITION'] = 'move_to_position'
  RobotCommandType['RUN_PROGRAM'] = 'run_program'
  RobotCommandType['LOAD_PROGRAM'] = 'load_program'
  RobotCommandType['SET_SPEED'] = 'set_speed'
  RobotCommandType['CALIBRATE'] = 'calibrate'
  RobotCommandType['UPDATE_FIRMWARE'] = 'update_firmware'
  RobotCommandType['CUSTOM'] = 'custom'
})(RobotCommandType || (exports.RobotCommandType = RobotCommandType = {}))
var CommandPriority
;(function (CommandPriority) {
  CommandPriority['LOW'] = 'low'
  CommandPriority['NORMAL'] = 'normal'
  CommandPriority['HIGH'] = 'high'
  CommandPriority['CRITICAL'] = 'critical'
})(CommandPriority || (exports.CommandPriority = CommandPriority = {}))
var CommandStatus
;(function (CommandStatus) {
  CommandStatus['PENDING'] = 'pending'
  CommandStatus['QUEUED'] = 'queued'
  CommandStatus['EXECUTING'] = 'executing'
  CommandStatus['COMPLETED'] = 'completed'
  CommandStatus['FAILED'] = 'failed'
  CommandStatus['CANCELLED'] = 'cancelled'
  CommandStatus['TIMEOUT'] = 'timeout'
})(CommandStatus || (exports.CommandStatus = CommandStatus = {}))
//# sourceMappingURL=robot.js.map
