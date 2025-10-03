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
  preventive: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Preventive' },
  corrective: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Corrective' },
  emergency: { color: 'text-red-600', bg: 'bg-red-100', label: 'Emergency' },
}

const priorityConfig = {
  low: { color: 'text-green-600', bg: 'bg-green-100', label: 'Low' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium' },
  high: { color: 'text-orange-600', bg: 'bg-orange-100', label: 'High' },
  critical: { color: 'text-red-600', bg: 'bg-red-100', label: 'Critical' },
}

const statusConfig = {
  scheduled: { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Scheduled' },
  in_progress: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'In Progress' },
  completed: { color: 'text-green-600', bg: 'bg-green-100', label: 'Completed' },
  overdue: { color: 'text-red-600', bg: 'bg-red-100', label: 'Overdue' },
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
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
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
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
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
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
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
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-semibold mb-2">{task.title}</h3>

                        {/* Badges - wrap on mobile */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              type.bg,
                              type.color
                            )}
                          >
                            {type.label}
                          </span>

                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              priority.bg,
                              priority.color
                            )}
                          >
                            {priority.label}
                          </span>

                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap',
                              status.bg,
                              status.color
                            )}
                          >
                            {status.label}
                          </span>
                        </div>

                        <p className="text-muted-foreground text-sm mb-3">{task.description}</p>

                        {/* Info Grid - 1 col mobile, 2 col tablet, 4 col desktop */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
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
                          <div className="mt-3 p-3 bg-muted rounded-md">
                            <p className="text-sm">
                              <strong>Notes:</strong> {task.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - full width on mobile */}
                      <div className="flex sm:flex-col items-center gap-2 sm:ml-4">
                        {task.status === 'scheduled' && (
                          <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 min-h-[44px] whitespace-nowrap">
                            Start
                          </button>
                        )}

                        {task.status === 'in_progress' && (
                          <button className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 min-h-[44px] whitespace-nowrap">
                            Complete
                          </button>
                        )}

                        <button className="min-h-[44px] min-w-[44px] p-2 rounded-md border border-border hover:bg-muted">
                          <Wrench className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {task.status === 'overdue' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center space-x-2 text-red-700 text-sm">
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
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date()
                    date.setDate(date.getDate() - date.getDay() + i)
                    const hasTask = mockMaintenanceTasks.some(
                      (task) =>
                        format(
                          typeof task.scheduledDate === 'string'
                            ? parseISO(task.scheduledDate)
                            : task.scheduledDate,
                          'yyyy-MM-dd'
                        ) === format(date, 'yyyy-MM-dd')
                    )

                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-12 rounded-md border border-border flex items-center justify-center text-sm cursor-pointer hover:bg-muted',
                          hasTask && 'bg-blue-100 border-blue-300'
                        )}
                      >
                        {date.getDate()}
                        {hasTask && <div className="w-2 h-2 bg-blue-600 rounded-full ml-1" />}
                      </div>
                    )
                  })}
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
