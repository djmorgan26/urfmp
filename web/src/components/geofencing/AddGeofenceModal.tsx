import { useState } from 'react'
import { X, Shield, Plus, Trash2, MapPin, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

interface AddGeofenceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface GeofenceFormData {
  name: string
  description: string
  type: 'circle' | 'polygon' | 'rectangle'
  coordinates: Array<{ latitude: number; longitude: number }>
  radius: number
  rules: Array<{
    id: string
    name: string
    trigger: 'enter' | 'exit' | 'dwell' | 'speed_limit'
    condition?: {
      minDuration?: number
      maxSpeed?: number
    }
    actions: Array<{
      id: string
      type: 'alert' | 'stop_robot' | 'slow_robot' | 'redirect' | 'notify' | 'log'
      parameters: Record<string, any>
      priority: 'low' | 'medium' | 'high' | 'critical'
    }>
    isActive: boolean
  }>
  isActive: boolean
  color: string
  strokeWidth: number
  fillOpacity: number
  robotIds: string[]
}

const geofenceTypes = [
  { id: 'circle', name: 'Circle', description: 'Circular boundary with radius', icon: '●' },
  { id: 'rectangle', name: 'Rectangle', description: 'Rectangular boundary area', icon: '▭' },
  { id: 'polygon', name: 'Polygon', description: 'Custom multi-point boundary', icon: '▲' },
]

const triggerTypes = [
  { id: 'enter', name: 'Enter', description: 'Robot enters the geofence' },
  { id: 'exit', name: 'Exit', description: 'Robot exits the geofence' },
  { id: 'dwell', name: 'Dwell', description: 'Robot stays too long' },
  { id: 'speed_limit', name: 'Speed Limit', description: 'Robot exceeds speed limit' },
]

const actionTypes = [
  { id: 'alert', name: 'Alert', description: 'Send alert notification' },
  { id: 'stop_robot', name: 'Stop Robot', description: 'Emergency stop robot' },
  { id: 'slow_robot', name: 'Slow Robot', description: 'Reduce robot speed' },
  { id: 'redirect', name: 'Redirect', description: 'Change robot path' },
  { id: 'notify', name: 'Notify', description: 'Send notification' },
  { id: 'log', name: 'Log', description: 'Log the event' },
]

const priorityLevels = [
  {
    id: 'low',
    name: 'Low',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    id: 'medium',
    name: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  {
    id: 'high',
    name: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  },
  {
    id: 'critical',
    name: 'Critical',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  },
]

const predefinedColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
]

export function AddGeofenceModal({ isOpen, onClose, onSuccess }: AddGeofenceModalProps) {
  const { isDark } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<GeofenceFormData>({
    name: '',
    description: '',
    type: 'circle',
    coordinates: [{ latitude: 40.7589, longitude: -73.9851 }],
    radius: 50,
    rules: [],
    isActive: true,
    color: '#3b82f6',
    strokeWidth: 2,
    fillOpacity: 0.2,
    robotIds: [],
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Geofence name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters'
    }

    if (formData.type === 'circle') {
      if (formData.radius <= 0) {
        newErrors.radius = 'Radius must be greater than 0'
      } else if (formData.radius > 5000) {
        newErrors.radius = 'Radius cannot exceed 5000 meters'
      }
      if (formData.coordinates.length !== 1) {
        newErrors.coordinates = 'Circle requires exactly one center point'
      }
    } else {
      if (formData.coordinates.length < 3) {
        newErrors.coordinates = `${formData.type} requires at least 3 points`
      }
    }

    // Validate coordinates
    formData.coordinates.forEach((coord, index) => {
      if (coord.latitude < -90 || coord.latitude > 90) {
        newErrors[`coord_${index}_lat`] = `Point ${index + 1} latitude must be between -90 and 90`
      }
      if (coord.longitude < -180 || coord.longitude > 180) {
        newErrors[`coord_${index}_lng`] =
          `Point ${index + 1} longitude must be between -180 and 180`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addCoordinate = () => {
    const lastCoord = formData.coordinates[formData.coordinates.length - 1] || {
      latitude: 40.7589,
      longitude: -73.9851,
    }
    setFormData((prev) => ({
      ...prev,
      coordinates: [...prev.coordinates, { ...lastCoord }],
    }))
  }

  const removeCoordinate = (index: number) => {
    if (formData.coordinates.length > 1) {
      setFormData((prev) => ({
        ...prev,
        coordinates: prev.coordinates.filter((_, i) => i !== index),
      }))
    }
  }

  const updateCoordinate = (index: number, field: 'latitude' | 'longitude', value: number) => {
    setFormData((prev) => ({
      ...prev,
      coordinates: prev.coordinates.map((coord, i) =>
        i === index ? { ...coord, [field]: value } : coord
      ),
    }))
  }

  const addRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      name: '',
      trigger: 'enter' as const,
      actions: [],
      isActive: true,
    }
    setFormData((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }))
  }

  const removeRule = (ruleId: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.filter((rule) => rule.id !== ruleId),
    }))
  }

  const updateRule = (ruleId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) => (rule.id === ruleId ? { ...rule, [field]: value } : rule)),
    }))
  }

  const addRuleAction = (ruleId: string) => {
    const newAction = {
      id: `action_${Date.now()}`,
      type: 'alert' as const,
      parameters: {},
      priority: 'medium' as const,
    }
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, actions: [...rule.actions, newAction] } : rule
      ),
    }))
  }

  const removeRuleAction = (ruleId: string, actionId: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.id === ruleId
          ? { ...rule, actions: rule.actions.filter((action) => action.id !== actionId) }
          : rule
      ),
    }))
  }

  const updateRuleAction = (ruleId: string, actionId: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      rules: prev.rules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              actions: rule.actions.map((action) =>
                action.id === actionId ? { ...action, [field]: value } : action
              ),
            }
          : rule
      ),
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
      await new Promise((resolve) => setTimeout(resolve, 1500))

      console.log('Creating geofence:', formData)
      toast.success('Geofence created successfully!')
      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'circle',
        coordinates: [{ latitude: 40.7589, longitude: -73.9851 }],
        radius: 50,
        rules: [],
        isActive: true,
        color: '#3b82f6',
        strokeWidth: 2,
        fillOpacity: 0.2,
        robotIds: [],
      })
      setErrors({})
    } catch (error) {
      toast.error('Failed to create geofence. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      'w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2'
    const errorClass = errors[fieldName]
      ? 'border-red-500 focus:ring-red-500'
      : 'border-input bg-background focus:ring-ring'
    return `${baseClass} ${errorClass}`
  }

  const renderFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      return <p className="text-red-500 text-xs mt-1">{errors[fieldName]}</p>
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div
          className={cn(
            'relative w-full max-w-5xl rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Create Geofence</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Geofence Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={getInputClassName('name')}
                    placeholder="e.g., Restricted Zone Alpha"
                  />
                  {renderFieldError('name')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
                    className={getInputClassName('isActive')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={getInputClassName('description')}
                    placeholder="Describe the purpose and restrictions of this geofence..."
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Geofence Type */}
            <div className="space-y-4">
              <h3 className="font-medium">Geofence Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {geofenceTypes.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      'p-4 rounded-lg border cursor-pointer transition-colors',
                      formData.type === type.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted'
                    )}
                    onClick={() => {
                      handleInputChange('type', type.id)
                      // Reset coordinates when changing type
                      if (type.id === 'circle') {
                        setFormData((prev) => ({
                          ...prev,
                          coordinates: [
                            prev.coordinates[0] || { latitude: 40.7589, longitude: -73.9851 },
                          ],
                        }))
                      }
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{type.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinates & Shape */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {formData.type === 'circle' ? 'Center Point' : 'Boundary Points'}
                </h3>
                {formData.type !== 'circle' && (
                  <button
                    type="button"
                    onClick={addCoordinate}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Point</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {formData.coordinates.map((coord, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">
                        {formData.type === 'circle' ? 'Center Point' : `Point ${index + 1}`}
                      </span>
                      {formData.type !== 'circle' && formData.coordinates.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeCoordinate(index)}
                          className="p-1 hover:bg-muted rounded text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Latitude *</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.latitude || 0}
                          onChange={(e) =>
                            updateCoordinate(index, 'latitude', parseFloat(e.target.value) || 0)
                          }
                          className={getInputClassName(`coord_${index}_lat`)}
                          placeholder="40.7589"
                        />
                        {renderFieldError(`coord_${index}_lat`)}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Longitude *</label>
                        <input
                          type="number"
                          step="0.000001"
                          value={coord.longitude || 0}
                          onChange={(e) =>
                            updateCoordinate(index, 'longitude', parseFloat(e.target.value) || 0)
                          }
                          className={getInputClassName(`coord_${index}_lng`)}
                          placeholder="-73.9851"
                        />
                        {renderFieldError(`coord_${index}_lng`)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Radius for circle */}
              {formData.type === 'circle' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Radius (meters) *</label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={formData.radius || 50}
                      onChange={(e) => handleInputChange('radius', parseInt(e.target.value) || 50)}
                      className={getInputClassName('radius')}
                      placeholder="50"
                    />
                    {renderFieldError('radius')}
                  </div>
                </div>
              )}

              {renderFieldError('coordinates')}
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="font-medium">Visual Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Border Color</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleInputChange('color', color)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                          formData.color === color
                            ? 'border-gray-800 dark:border-gray-200'
                            : 'border-gray-300'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full h-10 rounded border border-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Border Width</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.strokeWidth}
                    onChange={(e) => handleInputChange('strokeWidth', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">{formData.strokeWidth}px</div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fill Opacity</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.fillOpacity}
                    onChange={(e) => handleInputChange('fillOpacity', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(formData.fillOpacity * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Geofence Rules</h3>
                <button
                  type="button"
                  onClick={addRule}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Rule</span>
                </button>
              </div>

              {formData.rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No rules configured</p>
                  <p className="text-xs">
                    Add rules to define what happens when robots interact with this geofence
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.rules.map((rule, ruleIndex) => (
                    <div key={rule.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium text-sm">Rule {ruleIndex + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeRule(rule.id)}
                          className="p-1 hover:bg-muted rounded text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Rule Name</label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="e.g., Entry Alert"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Trigger</label>
                          <select
                            value={rule.trigger}
                            onChange={(e) => updateRule(rule.id, 'trigger', e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          >
                            {triggerTypes.map((trigger) => (
                              <option key={trigger.id} value={trigger.id}>
                                {trigger.name} - {trigger.description}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Conditional fields based on trigger type */}
                        {rule.trigger === 'dwell' && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Min Duration (seconds)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={rule.condition?.minDuration || 60}
                              onChange={(e) =>
                                updateRule(rule.id, 'condition', {
                                  ...rule.condition,
                                  minDuration: parseInt(e.target.value) || 60,
                                })
                              }
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="60"
                            />
                          </div>
                        )}

                        {rule.trigger === 'speed_limit' && (
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Max Speed (m/s)
                            </label>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={rule.condition?.maxSpeed || 2.0}
                              onChange={(e) =>
                                updateRule(rule.id, 'condition', {
                                  ...rule.condition,
                                  maxSpeed: parseFloat(e.target.value) || 2.0,
                                })
                              }
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                              placeholder="2.0"
                            />
                          </div>
                        )}
                      </div>

                      {/* Rule Actions */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            Actions ({rule.actions.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => addRuleAction(rule.id)}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add Action</span>
                          </button>
                        </div>

                        {rule.actions.map((action, actionIndex) => (
                          <div key={action.id} className="p-3 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium">Action {actionIndex + 1}</span>
                              <button
                                type="button"
                                onClick={() => removeRuleAction(rule.id, action.id)}
                                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-red-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <select
                                  value={action.type}
                                  onChange={(e) =>
                                    updateRuleAction(rule.id, action.id, 'type', e.target.value)
                                  }
                                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  {actionTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <select
                                  value={action.priority}
                                  onChange={(e) =>
                                    updateRuleAction(rule.id, action.id, 'priority', e.target.value)
                                  }
                                  className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                  {priorityLevels.map((priority) => (
                                    <option key={priority.id} value={priority.id}>
                                      {priority.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
                    <Shield className="h-4 w-4" />
                    <span>Create Geofence</span>
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
