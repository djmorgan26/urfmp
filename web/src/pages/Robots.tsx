import { useState, useMemo } from 'react'
import { Plus, Search, Activity, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useURFMP } from '@/hooks/useURFMP'
import { RobotCard } from '@/components/dashboard/RobotCard'
import { AddRobotModal } from '@/components/robots/AddRobotModal'

export function Robots() {
  const { robots, isLoading, refreshRobots } = useURFMP()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: robots.length,
      online: robots.filter((r) => r.status === 'online').length,
      running: robots.filter((r) => r.status === 'running').length,
      idle: robots.filter((r) => r.status === 'idle').length,
      offline: robots.filter((r) => r.status === 'offline').length,
      error: robots.filter((r) => r.status === 'error' || r.status === 'emergency_stop').length,
      maintenance: robots.filter((r) => r.status === 'maintenance').length,
    }
  }, [robots])

  const filteredRobots = robots.filter((robot) => {
    const matchesSearch =
      robot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.vendor.toLowerCase().includes(searchQuery.toLowerCase())

    // Handle "Issues" filter - includes both error and maintenance statuses
    const matchesStatus =
      statusFilter === 'all' ||
      robot.status === statusFilter ||
      (statusFilter === 'error' &&
        (robot.status === 'error' ||
          robot.status === 'emergency_stop' ||
          robot.status === 'maintenance'))

    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-2">Loading robots...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Robot Fleet</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {stats.total} robot{stats.total !== 1 ? 's' : ''} • {stats.online + stats.running}{' '}
            active
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Robot</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'all'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Total</div>
        </button>

        <button
          onClick={() => setStatusFilter('running')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'running'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-border hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.running}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Running</div>
        </button>

        <button
          onClick={() => setStatusFilter('online')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'online'
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
              : 'border-border hover:border-green-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.online}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Online</div>
        </button>

        <button
          onClick={() => setStatusFilter('idle')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'idle'
              ? 'border-gray-500 bg-gray-50 dark:bg-gray-950/20'
              : 'border-border hover:border-gray-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.idle}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Idle</div>
        </button>

        <button
          onClick={() => setStatusFilter('offline')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'offline'
              ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
              : 'border-border hover:border-red-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.offline}</div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Offline</div>
        </button>

        <button
          onClick={() => setStatusFilter('error')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'error'
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
              : 'border-border hover:border-orange-500/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.error + stats.maintenance}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">Issues</div>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1 max-w-none sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, model, or vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
          />
        </div>

        {statusFilter !== 'all' && (
          <button
            onClick={() => setStatusFilter('all')}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors min-h-[44px] whitespace-nowrap"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Results Count */}
      {filteredRobots.length !== robots.length && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredRobots.length} of {robots.length} robots
        </div>
      )}

      {/* Robot Grid */}
      {filteredRobots.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredRobots.map((robot) => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' ? (
              <>
                <p className="text-lg mb-2">No robots match your filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  className="text-sm text-primary hover:underline mt-2"
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">No robots found</p>
                <p className="text-sm">Get started by adding your first robot</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  Add Your First Robot
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Robot Modal */}
      <AddRobotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refreshRobots}
      />
    </div>
  )
}
