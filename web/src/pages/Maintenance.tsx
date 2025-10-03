import { useState } from 'react'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Wrench,
  Bot,
  User,
  BarChart3,
  Activity,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { formatDistanceToNow, format, parseISO } from 'date-fns'
import { PredictiveMaintenanceDashboard } from '../components/maintenance/PredictiveMaintenanceDashboard'
import { CreateMaintenanceModal } from '../components/maintenance/CreateMaintenanceModal'

interface MaintenanceTask {
  id: string
  robot: string
  type: 'preventive' | 'corrective' | 'emergency'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  scheduledDate: Date
  completedDate?: Date
  estimatedDuration: number
  assignedTo?: string
  notes?: string
}

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    robot: 'UR10e-001',
    type: 'preventive',
    title: 'Quarterly Calibration',
    description: 'Perform full robot calibration and joint accuracy check',
    priority: 'medium',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    estimatedDuration: 120,
    assignedTo: 'John Smith',
  },
  {
    id: '2',
    robot: 'UR5e-002',
    type: 'corrective',
    title: 'Replace Tool Connector',
    description: 'Tool connector showing signs of wear, replacement required',
    priority: 'high',
    status: 'in_progress',
    scheduledDate: new Date(Date.now() - 60 * 60 * 1000),
    estimatedDuration: 45,
    assignedTo: 'Sarah Johnson',
  },
  {
    id: '3',
    robot: 'UR3e-003',
    type: 'preventive',
    title: 'Lubrication Service',
    description: 'Apply fresh lubrication to all joints and moving parts',
    priority: 'low',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    estimatedDuration: 30,
    assignedTo: 'Mike Wilson',
    notes: 'Service completed successfully. All joints operating smoothly.',
  },
  {
    id: '4',
    robot: 'UR10e-004',
    type: 'emergency',
    title: 'Safety System Check',
    description: 'Emergency stop triggered unexpectedly, safety system inspection required',
    priority: 'critical',
    status: 'overdue',
    scheduledDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
    estimatedDuration: 90,
  },
]

const typeConfig = {
  preventive: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'Preventive',
  },
  corrective: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    label: 'Corrective',
  },
  emergency: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950/30',
    label: 'Emergency',
  },
}

const priorityConfig = {
  low: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950/30',
    label: 'Low',
  },
  medium: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    label: 'Medium',
  },
  high: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-950/30',
    label: 'High',
  },
  critical: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950/30',
    label: 'Critical',
  },
}

const statusConfig = {
  scheduled: {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    label: 'Scheduled',
  },
  in_progress: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-950/30',
    label: 'In Progress',
  },
  completed: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950/30',
    label: 'Completed',
  },
  overdue: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-950/30',
    label: 'Overdue',
  },
}

export function Maintenance() {
  const [activeTab, setActiveTab] = useState<'predictive' | 'scheduled' | 'history'>('predictive')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredTasks = mockMaintenanceTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.robot.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesType = typeFilter === 'all' || task.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const upcomingTasks = filteredTasks.filter((task) => task.status === 'scheduled').length
  const inProgressTasks = filteredTasks.filter((task) => task.status === 'in_progress').length
  const overdueTasks = filteredTasks.filter((task) => task.status === 'overdue').length

  return (
    <div className="space-y-6">
      {/* Header - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            AI-powered predictive maintenance and task scheduling
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 min-h-[44px] whitespace-nowrap"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Navigation Tabs - Scrollable on mobile */}
      <div className="border-b border-border -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setActiveTab('predictive')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === 'predictive'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-700'
            )}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span>Predictive Analytics</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-700'
            )}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Scheduled Tasks</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-gray-700'
            )}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 flex-shrink-0" />
              <span>History</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'predictive' && <PredictiveMaintenanceDashboard />}

      {activeTab === 'scheduled' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{upcomingTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Next in 2 days</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold">{inProgressTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Active now</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold">{overdueTasks}</p>
              <p className="text-sm text-muted-foreground mt-1">Requires attention</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-muted-foreground mt-1">This month</p>
            </div>
          </div>

          {/* Filters - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search maintenance tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[44px]"
            >
              <option value="all">All Types</option>
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          {/* Maintenance Tasks */}
          <div className="space-y-4">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const type = typeConfig[task.type]
                const priority = priorityConfig[task.priority]
                const status = statusConfig[task.status]

                return (
                  <div
                    key={task.id}
                    className="bg-card rounded-lg border border-border p-4 sm:p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Mobile: Stack everything vertically */}
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-semibold mb-3">{task.title}</h3>

                        {/* Badges - wrap on mobile with more spacing */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              type.bg,
                              type.color
                            )}
                          >
                            {type.label}
                          </span>

                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              priority.bg,
                              priority.color
                            )}
                          >
                            {priority.label}
                          </span>

                          <span
                            className={cn(
                              'px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              status.bg,
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-sm mb-4">{task.description}</p>

                        {/* Info Grid - 1 col mobile, 2 col tablet, 4 col desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-4">
                          <div className="flex items-center space-x-2">
                            <Bot className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{task.robot}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">
                              {format(
                                typeof task.scheduledDate === 'string'
                                  ? parseISO(task.scheduledDate)
                                  : task.scheduledDate,
                                'MMM dd, yyyy'
                              )}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{task.estimatedDuration} min</span>
                          </div>

                          {task.assignedTo && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{task.assignedTo}</span>
                            </div>
                          )}
                        </div>

                        {task.notes && (
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">
                              <strong>Notes:</strong> {task.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - full width on mobile */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        {task.status === 'scheduled' && (
                          <button className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 min-h-[44px] whitespace-nowrap font-medium">
                            Start
                          </button>
                        )}

                        {task.status === 'in_progress' && (
                          <button className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white text-sm rounded-md hover:bg-green-700 dark:hover:bg-green-600 min-h-[44px] whitespace-nowrap font-medium">
                            Complete
                          </button>
                        )}

                        <button
                          className="min-h-[44px] min-w-[44px] p-2 rounded-md border border-border hover:bg-muted"
                          title="Edit task"
                        >
                          <Wrench className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {task.status === 'overdue' && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-md">
                        <div className="flex items-center space-x-2 text-red-700 dark:text-red-300 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>
                            This task is overdue by{' '}
                            {formatDistanceToNow(
                              typeof task.scheduledDate === 'string'
                                ? parseISO(task.scheduledDate)
                                : task.scheduledDate
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No maintenance tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No tasks match your current filters'
                    : 'Schedule your first maintenance task to get started'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Schedule Maintenance
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Maintenance Calendar View */}
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Maintenance Calendar</h3>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="min-w-[600px]">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - date.getDay() + i)
                    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                    const isPast = date < new Date() && !isToday

                    // Find tasks for this date
                    const tasksForDate = mockMaintenanceTasks.filter(
                      (task) =>
                        format(
                          typeof task.scheduledDate === 'string'
                            ? parseISO(task.scheduledDate)
                            : task.scheduledDate,
                          'yyyy-MM-dd'
                        ) === format(date, 'yyyy-MM-dd')
                    )
                    const hasTask = tasksForDate.length > 0
                    const hasCritical = tasksForDate.some((t) => t.priority === 'critical')
                    const hasHigh = tasksForDate.some((t) => t.priority === 'high')

                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-12 sm:h-14 rounded-md border flex flex-col items-center justify-center text-sm cursor-pointer transition-all min-h-[44px]',
                          isPast && 'opacity-40',
                          isToday && 'ring-2 ring-primary ring-offset-1 font-semibold',
                          !hasTask && 'border-border hover:bg-muted hover:border-primary/50',
                          hasTask &&
                            !hasCritical &&
                            !hasHigh &&
                            'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-950/50',
                          hasHigh &&
                            'bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-950/50',
                          hasCritical &&
                            'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-700 hover:bg-red-200 dark:hover:bg-red-950/50'
                        )}
                        title={
                          hasTask
                            ? `${tasksForDate.length} task${tasksForDate.length > 1 ? 's' : ''} scheduled`
                            : 'No tasks'
                        }
                      >
                        <span
                          className={cn(
                            'text-xs sm:text-sm',
                            isToday && 'font-bold',
                            hasCritical && 'text-red-700 dark:text-red-300',
                            hasHigh && !hasCritical && 'text-orange-700 dark:text-orange-300',
                            hasTask &&
                              !hasCritical &&
                              !hasHigh &&
                              'text-blue-700 dark:text-blue-300'
                          )}
                        >
                          {date.getDate()}
                        </span>
                        {hasTask && (
                          <div className="flex gap-0.5 mt-0.5">
                            {tasksForDate.slice(0, 3).map((task, idx) => (
                              <div
                                key={idx}
                                className={cn(
                                  'w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full',
                                  task.priority === 'critical' && 'bg-red-600 dark:bg-red-400',
                                  task.priority === 'high' && 'bg-orange-600 dark:bg-orange-400',
                                  task.priority === 'medium' && 'bg-yellow-600 dark:bg-yellow-400',
                                  task.priority === 'low' && 'bg-blue-600 dark:bg-blue-400'
                                )}
                              />
                            ))}
                            {tasksForDate.length > 3 && (
                              <span className="text-[8px] sm:text-[10px] font-medium">
                                +{tasksForDate.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-700" />
                    <span className="text-muted-foreground">Critical</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-700" />
                    <span className="text-muted-foreground">High Priority</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700" />
                    <span className="text-muted-foreground">Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded border-2 border-primary" />
                    <span className="text-muted-foreground">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Maintenance History</h3>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3" />
            <p>Maintenance history will be displayed here</p>
            <p className="text-sm">
              Track completed tasks, performance metrics, and maintenance trends
            </p>
          </div>
        </div>
      )}

      {/* Create Maintenance Modal */}
      <CreateMaintenanceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // In real implementation, refresh the maintenance tasks list
          console.log('Maintenance task created successfully')
        }}
      />
    </div>
  )
}
