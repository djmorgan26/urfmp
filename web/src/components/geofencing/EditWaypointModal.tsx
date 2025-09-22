import { useState, useEffect } from 'react'
import { X, MapPin, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

interface EditWaypointModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  waypoint: Waypoint | null
}

interface Waypoint {
  id: string
  name: string
  description: string
  coordinates: {
    latitude: number
    longitude: number
    altitude: number
  }
  type: 'pickup' | 'dropoff' | 'checkpoint' | 'charging' | 'maintenance' | 'custom'
  radius: number
  actions: Array<{
    id: string
    type: 'pause' | 'notify' | 'execute_command' | 'capture_data' | 'wait'
    parameters: Record<string, any>
    duration?: number
  }>
  isActive: boolean
}

interface WaypointFormData {
  name: string
  description: string
  coordinates: {
    latitude: number
    longitude: number
    altitude: number
  }
  type: 'pickup' | 'dropoff' | 'checkpoint' | 'charging' | 'maintenance' | 'custom'
  radius: number
  actions: Array<{
    id: string
    type: 'pause' | 'notify' | 'execute_command' | 'capture_data' | 'wait'
    parameters: Record<string, any>
    duration?: number
  }>
  isActive: boolean
}

const waypointTypes = [
  { id: 'pickup', name: 'Pickup', description: 'Material or item pickup location', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { id: 'dropoff', name: 'Drop-off', description: 'Delivery or drop-off location', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  { id: 'checkpoint', name: 'Checkpoint', description: 'Navigation checkpoint', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  { id: 'charging', name: 'Charging', description: 'Battery charging station', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { id: 'maintenance', name: 'Maintenance', description: 'Maintenance or service area', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  { id: 'custom', name: 'Custom', description: 'Custom waypoint type', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' },
]

const actionTypes = [
  { id: 'pause', name: 'Pause', description: 'Stop robot at waypoint' },
  { id: 'notify', name: 'Notify', description: 'Send notification' },
  { id: 'execute_command', name: 'Execute Command', description: 'Run custom command' },
  { id: 'capture_data', name: 'Capture Data', description: 'Record sensor data' },
  { id: 'wait', name: 'Wait', description: 'Wait for specified duration' },
]

export function EditWaypointModal({ isOpen, onClose, onSuccess, waypoint }: EditWaypointModalProps) {
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<WaypointFormData>({
    name: '',
    description: '',
    coordinates: {
      latitude: 0,
      longitude: 0,
      altitude: 0
    },
    type: 'checkpoint',
    radius: 5,
    actions: [],
    isActive: true
  })

  // Load waypoint data when modal opens or waypoint changes
  useEffect(() => {
    if (waypoint && isOpen) {
      setFormData({
        name: waypoint.name || '',
        description: waypoint.description || '',
        coordinates: {
          latitude: waypoint.coordinates?.latitude || 0,
          longitude: waypoint.coordinates?.longitude || 0,
          altitude: waypoint.coordinates?.altitude || 0
        },
        type: waypoint.type || 'checkpoint',
        radius: waypoint.radius || 5,
        actions: waypoint.actions ? waypoint.actions.map(action => ({
          id: action.id || `action_${Date.now()}`,
          type: action.type || 'notify',
          parameters: action.parameters || {},
          duration: action.duration || 0
        })) : [],
        isActive: waypoint.isActive ?? true
      })
      setErrors({})
    }
  }, [waypoint, isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Waypoint name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (formData.coordinates.latitude < -90 || formData.coordinates.latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90'
    }

    if (formData.coordinates.longitude < -180 || formData.coordinates.longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180'
    }

    if (formData.radius <= 0) {
      newErrors.radius = 'Radius must be greater than 0'
    } else if (formData.radius > 1000) {
      newErrors.radius = 'Radius cannot exceed 1000 meters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof WaypointFormData],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const addAction = () => {
    const newAction = {
      id: `action_${Date.now()}`,
      type: 'notify' as const,
      parameters: {},
      duration: 0
    }
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }))
  }

  const removeAction = (actionId: string) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== actionId)
    }))
  }

  const updateAction = (actionId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map(action =>
        action.id === actionId
          ? { ...action, [field]: value }
          : action
      )
    }))
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

      console.log('Updating waypoint:', { id: waypoint?.id, ...formData })
      toast.success('Waypoint updated successfully!')
      onSuccess?.(0)
      onClose()
    } catch (error) {
      toast.error('Failed to update waypoint. Please try again.')
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

  if (!isOpen || !waypoint) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className={cn(
          'relative w-full max-w-2xl rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Edit Waypoint</h2>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Waypoint Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={getInputClassName('name')}
                    placeholder="e.g., Assembly Station A"
                  />
                  {renderFieldError('name')}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={getInputClassName('description')}
                    placeholder="Describe the purpose of this waypoint..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Waypoint Type */}
            <div className="space-y-4">
              <h3 className="font-medium">Waypoint Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {waypointTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer transition-colors',
                      formData.type === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    onClick={() => handleInputChange('type', type.id)}
                  >
                    <div className="text-center">
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${type.color}`}>
                        {type.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinates */}
            <div className="space-y-4">
              <h3 className="font-medium">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.latitude || 0}
                    onChange={(e) => handleInputChange('coordinates.latitude', parseFloat(e.target.value) || 0)}
                    className={getInputClassName('latitude')}
                    placeholder="40.7589"
                  />
                  {renderFieldError('latitude')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Longitude *</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.coordinates.longitude || 0}
                    onChange={(e) => handleInputChange('coordinates.longitude', parseFloat(e.target.value) || 0)}
                    className={getInputClassName('longitude')}
                    placeholder="-73.9851"
                  />
                  {renderFieldError('longitude')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Altitude (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.coordinates.altitude || 0}
                    onChange={(e) => handleInputChange('coordinates.altitude', parseFloat(e.target.value) || 0)}
                    className={getInputClassName('altitude')}
                    placeholder="10.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Radius (m) *</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.radius || 5}
                    onChange={(e) => handleInputChange('radius', parseInt(e.target.value) || 1)}
                    className={getInputClassName('radius')}
                    placeholder="5"
                  />
                  {renderFieldError('radius')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Waypoint Actions</h3>
                <button
                  type="button"
                  onClick={addAction}
                  className="flex items-center space-x-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Action</span>
                </button>
              </div>

              {formData.actions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No actions configured</p>
                  <p className="text-xs">Add actions to define what happens when robots reach this waypoint</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.actions.map((action, index) => (
                    <div key={action.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-sm">Action {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeAction(action.id)}
                          className="p-1 hover:bg-muted rounded text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Action Type</label>
                          <select
                            value={action.type}
                            onChange={(e) => updateAction(action.id, 'type', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {actionTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.name} - {type.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {(action.type === 'pause' || action.type === 'wait') && (
                          <div>
                            <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                            <input
                              type="number"
                              min="0"
                              value={action.duration || 0}
                              onChange={(e) => updateAction(action.id, 'duration', parseInt(e.target.value) || 0)}
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="10"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Settings</h3>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Keep waypoint active
                </label>
              </div>
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4" />
                    <span>Update Waypoint</span>
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