import { useState } from 'react'
import {
  MapPin,
  Shield,
  GitBranch,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  Navigation,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { useGeofencing } from '../../hooks/useGeofencing'
import { cn } from '../../lib/utils'
import { AddWaypointModal } from './AddWaypointModal'
import { EditWaypointModal } from './EditWaypointModal'

export function GeofencingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'waypoints' | 'geofences' | 'paths' | 'events'>('overview')
  const [showAddWaypointModal, setShowAddWaypointModal] = useState(false)
  const [showEditWaypointModal, setShowEditWaypointModal] = useState(false)
  const [selectedWaypoint, setSelectedWaypoint] = useState<any>(null)

  const {
    waypoints,
    geofences,
    paths,
    events,
    isLoading,
    error,
    refresh,
    deleteWaypoint,
    deleteGeofence,
    acknowledgeEvent,
    clearEvents
  } = useGeofencing()

  const handleEditWaypoint = (waypoint: any) => {
    setSelectedWaypoint(waypoint)
    setShowEditWaypointModal(true)
  }

  const handleWaypointSuccess = () => {
    refresh()
  }

  const activeWaypoints = waypoints.filter(wp => wp.isActive).length
  const activeGeofences = geofences.filter(gf => gf.isActive).length
  const activePaths = paths.filter(p => p.status === 'active').length
  const unacknowledgedEvents = events.filter(e => !e.acknowledged).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full" />
        <span className="ml-3 text-muted-foreground">Loading geofencing data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-red-800 dark:text-red-400 font-medium">Error loading geofencing data</span>
        </div>
        <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Geofencing & Waypoints</h2>
          <p className="text-muted-foreground">
            Manage robot navigation, boundaries, and automated actions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={refresh}
            className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 border-b border-border">
        {[
          { id: 'overview', label: 'Overview', icon: MapPin },
          { id: 'waypoints', label: 'Waypoints', icon: Navigation },
          { id: 'geofences', label: 'Geofences', icon: Shield },
          { id: 'paths', label: 'Paths', icon: GitBranch },
          { id: 'events', label: 'Events', icon: AlertTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            )}
          >
            <div className="flex items-center space-x-2">
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.id === 'events' && unacknowledgedEvents > 0 && (
                <span className="bg-red-500 dark:bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unacknowledgedEvents}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Waypoints</p>
                <Navigation className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold">{activeWaypoints}</p>
              <p className="text-sm text-muted-foreground">of {waypoints.length} total</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Geofences</p>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold">{activeGeofences}</p>
              <p className="text-sm text-muted-foreground">of {geofences.length} total</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Active Paths</p>
                <GitBranch className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-3xl font-bold">{activePaths}</p>
              <p className="text-sm text-muted-foreground">of {paths.length} total</p>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-3xl font-bold">{unacknowledgedEvents}</p>
              <p className="text-sm text-muted-foreground">require attention</p>
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Events</h3>
            <div className="space-y-3">
              {events.slice(0, 5).map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      event.severity === 'critical' ? 'bg-red-600' :
                      event.severity === 'error' ? 'bg-red-500' :
                      event.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    )} />
                    <div>
                      <p className="text-sm font-medium">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.robotName} • {event.geofenceName} • {event.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  {!event.acknowledged && (
                    <button
                      onClick={() => acknowledgeEvent(event.id, 'System')}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                  <p>No geofencing events</p>
                  <p className="text-sm">All robots are operating within defined boundaries</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Waypoints Tab */}
      {activeTab === 'waypoints' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Waypoints Management</h3>
            <button
              onClick={() => setShowAddWaypointModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Waypoint</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waypoints.map(waypoint => (
              <div key={waypoint.id} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      waypoint.type === 'pickup' ? 'bg-blue-600' :
                      waypoint.type === 'dropoff' ? 'bg-green-600' :
                      waypoint.type === 'charging' ? 'bg-yellow-600' :
                      waypoint.type === 'maintenance' ? 'bg-red-600' :
                      'bg-gray-600'
                    )} />
                    <h4 className="font-medium">{waypoint.name}</h4>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-muted rounded">
                      {waypoint.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleEditWaypoint(waypoint)}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteWaypoint(waypoint.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{waypoint.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{waypoint.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius:</span>
                    <span>{waypoint.radius}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Actions:</span>
                    <span>{waypoint.actions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coordinates:</span>
                    <span className="text-xs">
                      {waypoint.coordinates.latitude.toFixed(4)}, {waypoint.coordinates.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Geofences Tab */}
      {activeTab === 'geofences' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Geofences Management</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Add Geofence</span>
            </button>
          </div>

          <div className="space-y-4">
            {geofences.map(geofence => (
              <div key={geofence.id} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{ backgroundColor: geofence.color, borderColor: geofence.color }}
                      />
                      <h4 className="font-medium">{geofence.name}</h4>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        geofence.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      )}>
                        {geofence.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{geofence.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-muted rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteGeofence(geofence.id)}
                      className="p-1 hover:bg-muted rounded text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">Type</span>
                    <span className="capitalize">{geofence.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Rules</span>
                    <span>{geofence.rules.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Applied To</span>
                    <span>{geofence.robotIds.length || 'All'} robots</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Updated</span>
                    <span>{geofence.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>

                {geofence.rules.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-medium">Rules:</h5>
                    {geofence.rules.map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{rule.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {rule.trigger}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {rule.actions.length} actions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Path Management</h3>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              <span>Create Path</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paths.map(path => (
              <div key={path.id} className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">{path.name}</h4>
                    <p className="text-sm text-muted-foreground">{path.description}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs",
                    path.status === 'active' ? 'bg-green-100 text-green-800' :
                    path.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    path.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  )}>
                    {path.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-muted-foreground block">Distance</span>
                    <span>{path.totalDistance}m</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Duration</span>
                    <span>{Math.round(path.estimatedDuration / 60)}min</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Waypoints</span>
                    <span>{path.waypoints.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Optimized</span>
                    <div className="flex items-center space-x-1">
                      {path.isOptimized ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <span>{path.isOptimized ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="flex-1 px-3 py-2 border border-input rounded hover:bg-muted text-sm">
                    Edit Path
                  </button>
                  {!path.isOptimized && (
                    <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      <Zap className="h-4 w-4" />
                      <span>Optimize</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Geofencing Events</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearEvents}
                className="px-4 py-2 border border-input rounded-md hover:bg-muted text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full mt-2",
                      event.severity === 'critical' ? 'bg-red-600' :
                      event.severity === 'error' ? 'bg-red-500' :
                      event.severity === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    )} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{event.message}</h4>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs",
                          event.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          event.severity === 'error' ? 'bg-red-50 text-red-700' :
                          event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {event.severity}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Robot: {event.robotName} • Geofence: {event.geofenceName}</p>
                        <p>Rule: {event.ruleName} • Type: {event.eventType}</p>
                        <p>Time: {event.timestamp.toLocaleString()}</p>
                        {event.actionsTaken.length > 0 && (
                          <p>Actions: {event.actionsTaken.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {!event.acknowledged ? (
                      <button
                        onClick={() => acknowledgeEvent(event.id, 'System')}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <div className="text-xs text-muted-foreground text-right">
                        <p>Acknowledged</p>
                        <p>by {event.acknowledgedBy}</p>
                        <p>{event.acknowledgedAt?.toLocaleTimeString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-600" />
                <p>No geofencing events</p>
                <p className="text-sm">All robots are operating within defined boundaries</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <AddWaypointModal
        isOpen={showAddWaypointModal}
        onClose={() => setShowAddWaypointModal(false)}
        onSuccess={handleWaypointSuccess}
      />

      <EditWaypointModal
        isOpen={showEditWaypointModal}
        onClose={() => {
          setShowEditWaypointModal(false)
          setSelectedWaypoint(null)
        }}
        onSuccess={handleWaypointSuccess}
        waypoint={selectedWaypoint}
      />
    </div>
  )
}