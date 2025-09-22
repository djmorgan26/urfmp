import { useState, useEffect } from 'react'
import { X, GitBranch, Plus, Trash2, Navigation, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { useGeofencing } from '../../hooks/useGeofencing'
import { cn } from '../../utils/cn'

interface AddPathModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface PathFormData {
  name: string
  description: string
  waypoints: string[]
  robotId: string
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled'
}

const pathStatuses = [
  { id: 'draft', name: 'Draft', description: 'Path is being planned', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
  { id: 'active', name: 'Active', description: 'Path is currently in use', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { id: 'paused', name: 'Paused', description: 'Path execution is paused', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { id: 'cancelled', name: 'Cancelled', description: 'Path execution cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
]

export function AddPathModal({ isOpen, onClose, onSuccess }: AddPathModalProps) {
  const { isDark } = useTheme()
  const { waypoints } = useGeofencing()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<PathFormData>({
    name: '',
    description: '',
    waypoints: [],
    robotId: '',
    status: 'draft'
  })

  // Available waypoints for selection
  const availableWaypoints = waypoints.filter(wp => wp.isActive)
  const selectedWaypoints = waypoints.filter(wp => formData.waypoints.includes(wp.id))

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Path name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (formData.waypoints.length < 2) {
      newErrors.waypoints = 'Path must have at least 2 waypoints'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addWaypoint = (waypointId: string) => {
    if (!formData.waypoints.includes(waypointId)) {
      setFormData(prev => ({
        ...prev,
        waypoints: [...prev.waypoints, waypointId]
      }))
      if (errors.waypoints) {
        setErrors(prev => ({ ...prev, waypoints: '' }))
      }
    }
  }

  const removeWaypoint = (waypointId: string) => {
    setFormData(prev => ({
      ...prev,
      waypoints: prev.waypoints.filter(id => id !== waypointId)
    }))
  }

  const moveWaypoint = (fromIndex: number, toIndex: number) => {
    const newWaypoints = [...formData.waypoints]
    const [movedItem] = newWaypoints.splice(fromIndex, 1)
    newWaypoints.splice(toIndex, 0, movedItem)
    setFormData(prev => ({ ...prev, waypoints: newWaypoints }))
  }

  const optimizePath = () => {
    // Simple optimization: sort waypoints by name for demo
    const optimizedOrder = [...formData.waypoints].sort((a, b) => {
      const waypointA = waypoints.find(wp => wp.id === a)
      const waypointB = waypoints.find(wp => wp.id === b)
      return (waypointA?.name || '').localeCompare(waypointB?.name || '')
    })
    setFormData(prev => ({ ...prev, waypoints: optimizedOrder }))
    toast.success('Path optimized for efficiency!')
  }

  const calculateEstimatedDistance = (): number => {
    // Simple distance calculation for demo
    return formData.waypoints.length * 50 // 50m between waypoints
  }

  const calculateEstimatedDuration = (): number => {
    // Simple duration calculation for demo (2 minutes per waypoint)
    return formData.waypoints.length * 120
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const pathData = {
        ...formData,
        totalDistance: calculateEstimatedDistance(),
        estimatedDuration: calculateEstimatedDuration(),
        isOptimized: false
      }

      console.log('Creating path:', pathData)
      toast.success('Path created successfully!')
      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        name: '',
        description: '',
        waypoints: [],
        robotId: '',
        status: 'draft'
      })
      setErrors({})
    } catch (error) {
      toast.error('Failed to create path. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getInputClassName = (fieldName: string) => {
    const baseClass = "w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2"
    const errorClass = errors[fieldName]
      ? "border-red-500 focus:ring-red-500"
      : "border-input bg-background focus:ring-ring"
    return `${baseClass} ${errorClass}`
  }

  const renderFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      return (
        <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>
      )
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className={cn(
          'relative w-full max-w-4xl rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <GitBranch className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Create Path</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Path Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={getInputClassName('name')}
                    placeholder="e.g., Morning Delivery Route"
                  />
                  {renderFieldError('name')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Robot Assignment</label>
                  <select
                    value={formData.robotId}
                    onChange={(e) => handleInputChange('robotId', e.target.value)}
                    className={getInputClassName('robotId')}
                  >
                    <option value="">Any available robot</option>
                    <option value="robot-1">Robot Alpha</option>
                    <option value="robot-2">Robot Beta</option>
                    <option value="robot-3">Robot Gamma</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={getInputClassName('description')}
                    placeholder="Describe the purpose and details of this path..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Path Status */}
            <div className="space-y-4">
              <h3 className="font-medium">Path Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {pathStatuses.map((status) => (
                  <div
                    key={status.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      formData.status === status.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    onClick={() => handleInputChange('status', status.id)}
                  >
                    <div className="text-center">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${status.color}`}>
                        {status.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{status.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Waypoint Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Waypoints Selection *</h3>
                <div className="flex items-center space-x-2">
                  {formData.waypoints.length >= 2 && (
                    <button
                      type="button"
                      onClick={optimizePath}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      <Zap className="h-4 w-4" />
                      <span>Optimize</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Available Waypoints */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Available Waypoints</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {availableWaypoints.filter(wp => !formData.waypoints.includes(wp.id)).map(waypoint => (
                      <div
                        key={waypoint.id}
                        className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted cursor-pointer"
                        onClick={() => addWaypoint(waypoint.id)}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            waypoint.type === 'pickup' ? 'bg-blue-600' :
                            waypoint.type === 'dropoff' ? 'bg-green-600' :
                            waypoint.type === 'charging' ? 'bg-yellow-600' :
                            waypoint.type === 'maintenance' ? 'bg-red-600' :
                            'bg-gray-600'
                          )} />
                          <div>
                            <p className="text-sm font-medium">{waypoint.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{waypoint.type}</p>
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                    {availableWaypoints.filter(wp => !formData.waypoints.includes(wp.id)).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">All waypoints added to path</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Waypoints (Path Order) */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Path Sequence ({formData.waypoints.length} waypoints)</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                    {selectedWaypoints.map((waypoint, index) => (
                      <div key={waypoint.id} className="flex items-center justify-between p-2 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            {index + 1}
                          </span>
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            waypoint.type === 'pickup' ? 'bg-blue-600' :
                            waypoint.type === 'dropoff' ? 'bg-green-600' :
                            waypoint.type === 'charging' ? 'bg-yellow-600' :
                            waypoint.type === 'maintenance' ? 'bg-red-600' :
                            'bg-gray-600'
                          )} />
                          <div>
                            <p className="text-sm font-medium">{waypoint.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{waypoint.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveWaypoint(index, index - 1)}
                              className="p-1 hover:bg-muted rounded text-xs"
                            >
                              ↑
                            </button>
                          )}
                          {index < selectedWaypoints.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveWaypoint(index, index + 1)}
                              className="p-1 hover:bg-muted rounded text-xs"
                            >
                              ↓
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeWaypoint(waypoint.id)}
                            className="p-1 hover:bg-muted rounded text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {formData.waypoints.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No waypoints selected</p>
                        <p className="text-xs">Add waypoints to create a path</p>
                      </div>
                    )}
                  </div>
                  {renderFieldError('waypoints')}
                </div>
              </div>

              {/* Path Summary */}
              {formData.waypoints.length > 0 && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2">Path Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block">Waypoints</span>
                      <span className="font-medium">{formData.waypoints.length}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Est. Distance</span>
                      <span className="font-medium">{calculateEstimatedDistance()}m</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Est. Duration</span>
                      <span className="font-medium">{Math.round(calculateEstimatedDuration() / 60)}min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Optimized</span>
                      <span className="font-medium">No</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4" />
                    <span>Create Path</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}