import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useURFMP } from '@/hooks/useURFMP'
import { RobotCard } from '@/components/dashboard/RobotCard'
import { AddRobotModal } from '@/components/robots/AddRobotModal'

export function Robots() {
  const { robots, isLoading, refreshRobots } = useURFMP()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredRobots = robots.filter((robot) => {
    const matchesSearch =
      robot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.model.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || robot.status === statusFilter
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Robots</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your robot fleet</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>Add Robot</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search robots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="all">All Status</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="offline">Offline</option>
          <option value="error">Error</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      {/* Robot Grid */}
      {filteredRobots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRobots.map((robot) => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' ? (
              <p>No robots match your filters</p>
            ) : (
              <>
                <p className="text-lg mb-2">No robots found</p>
                <p className="text-sm">Get started by adding your first robot with the URFMP SDK</p>
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
