import { useState } from 'react'
import { X, Calendar, Clock, AlertTriangle, Bot, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { useURFMP } from '../../hooks/useURFMP'
import { cn } from '../../utils/cn'

interface CreateMaintenanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface MaintenanceFormData {
  title: string
  description: string
  robotId: string
  type: 'preventive' | 'corrective' | 'predictive' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'critical'
  scheduledDate: string
  estimatedDuration: number
  assignedTechnician: string
  requiredParts: string[]
  instructions: string
  recurrence?: 'none' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
}

const maintenanceTypes = [
  {
    id: 'preventive',
    name: 'Preventive',
    description: 'Scheduled routine maintenance',
    icon: Calendar,
  },
  { id: 'corrective', name: 'Corrective', description: 'Fix known issues', icon: Wrench },
  {
    id: 'predictive',
    name: 'Predictive',
    description: 'AI-recommended maintenance',
    icon: AlertTriangle,
  },
  { id: 'emergency', name: 'Emergency', description: 'Urgent repairs needed', icon: AlertTriangle },
]

const priorityLevels = [
  {
    id: 'low',
    name: 'Low',
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    id: 'medium',
    name: 'Medium',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  {
    id: 'high',
    name: 'High',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
  },
  {
    id: 'critical',
    name: 'Critical',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400',
  },
]

const recurrenceOptions = [
  { id: 'none', name: 'One-time' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'yearly', name: 'Yearly' },
]

export function CreateMaintenanceModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMaintenanceModalProps) {
  const { isDark } = useTheme()
  const { robots } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<MaintenanceFormData>({
    title: '',
    description: '',
    robotId: '',
    type: 'preventive',
    priority: 'medium',
    scheduledDate: '',
    estimatedDuration: 60,
    assignedTechnician: '',
    requiredParts: [],
    instructions: '',
    recurrence: 'none',
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }

    if (!formData.robotId) {
      newErrors.robotId = 'Please select a robot'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required'
    } else {
      const scheduledDate = new Date(formData.scheduledDate)
      const now = new Date()
      if (scheduledDate < now) {
        newErrors.scheduledDate = 'Scheduled date cannot be in the past'
      }
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Duration must be greater than 0'
    } else if (formData.estimatedDuration > 480) {
      newErrors.estimatedDuration = 'Duration cannot exceed 8 hours (480 minutes)'
    }

    if (!formData.assignedTechnician.trim()) {
      newErrors.assignedTechnician = 'Assigned technician is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
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

      toast.success('Maintenance task scheduled successfully!')
      onSuccess?.()
      onClose()

      // Reset form
      setFormData({
        title: '',
        description: '',
        robotId: '',
        type: 'preventive',
        priority: 'medium',
        scheduledDate: '',
        estimatedDuration: 60,
        assignedTechnician: '',
        requiredParts: [],
        instructions: '',
        recurrence: 'none',
      })
      setErrors({})
    } catch (error) {
      toast.error('Failed to schedule maintenance task. Please try again.')
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
            'relative w-full max-w-2xl rounded-lg p-6 shadow-lg max-h-[90vh] overflow-y-auto',
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Schedule Maintenance</h2>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={getInputClassName('title')}
                    placeholder="e.g., Quarterly calibration check"
                  />
                  {renderFieldError('title')}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={getInputClassName('description')}
                    placeholder="Detailed description of the maintenance task..."
                    rows={3}
                  />
                  {renderFieldError('description')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Robot *</label>
                  <select
                    value={formData.robotId}
                    onChange={(e) => handleInputChange('robotId', e.target.value)}
                    className={getInputClassName('robotId')}
                  >
                    <option value="">Select a robot</option>
                    {robots.map((robot) => (
                      <option key={robot.id} value={robot.id}>
                        {robot.name} ({robot.vendor} {robot.model})
                      </option>
                    ))}
                  </select>
                  {renderFieldError('robotId')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Assigned Technician *</label>
                  <input
                    type="text"
                    value={formData.assignedTechnician}
                    onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
                    className={getInputClassName('assignedTechnician')}
                    placeholder="e.g., John Smith"
                  />
                  {renderFieldError('assignedTechnician')}
                </div>
              </div>
            </div>

            {/* Maintenance Type & Priority */}
            <div className="space-y-4">
              <h3 className="font-medium">Type & Priority</h3>

              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {maintenanceTypes.map((type) => (
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
                      <div className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-muted-foreground">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Priority Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityLevels.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => handleInputChange('priority', level.id)}
                      className={cn(
                        'p-2 rounded-md text-sm font-medium transition-colors',
                        formData.priority === level.id ? level.color : 'bg-muted hover:bg-muted/80'
                      )}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-4">
              <h3 className="font-medium">Scheduling</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Scheduled Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    className={getInputClassName('scheduledDate')}
                  />
                  {renderFieldError('scheduledDate')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes) *</label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      handleInputChange('estimatedDuration', parseInt(e.target.value))
                    }
                    className={getInputClassName('estimatedDuration')}
                  />
                  {renderFieldError('estimatedDuration')}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recurrence</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => handleInputChange('recurrence', e.target.value)}
                    className={getInputClassName('recurrence')}
                  >
                    {recurrenceOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="font-medium">Additional Details</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className={getInputClassName('instructions')}
                  placeholder="Step-by-step instructions for the technician..."
                  rows={3}
                />
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
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Task</span>
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
