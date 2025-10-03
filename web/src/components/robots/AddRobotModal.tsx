import { useState } from 'react'
import { X, Plus, Sparkles, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useURFMP } from '@/hooks/useURFMP'

interface AddRobotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (force?: boolean) => void
}

interface RobotFormData {
  name: string
  vendor: string
  model: string
  serialNumber: string
  firmwareVersion: string
  location: {
    facility: string
    cell: string
  }
  configuration: {
    maxPayload: number
    reach: number
    joints: number
  }
}

export function AddRobotModal({ isOpen, onClose, onSuccess }: AddRobotModalProps) {
  const { urfmp } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<RobotFormData>({
    name: '',
    vendor: '',
    model: '',
    serialNumber: '',
    firmwareVersion: '',
    location: {
      facility: '',
      cell: '',
    },
    configuration: {
      maxPayload: 0,
      reach: 0,
      joints: 6,
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    if (!formData.name.trim()) {
      newErrors.name = 'Robot name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Robot name must be at least 3 characters'
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor is required'
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required'
    }

    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required'
    } else if (!/^[A-Z0-9-]{6,20}$/i.test(formData.serialNumber)) {
      newErrors.serialNumber = 'Serial number must be 6-20 alphanumeric characters'
    }

    if (!formData.firmwareVersion.trim()) {
      newErrors.firmwareVersion = 'Firmware version is required'
    } else if (!/^\d+\.\d+(\.\d+)?$/.test(formData.firmwareVersion)) {
      newErrors.firmwareVersion = 'Firmware version must be in format x.y.z'
    }

    if (!formData.location.facility.trim()) {
      newErrors['location.facility'] = 'Facility is required'
    }

    if (!formData.location.cell.trim()) {
      newErrors['location.cell'] = 'Cell is required'
    }

    // Configuration validation
    if (formData.configuration.maxPayload <= 0) {
      newErrors['configuration.maxPayload'] = 'Max payload must be greater than 0'
    } else if (formData.configuration.maxPayload > 1000) {
      newErrors['configuration.maxPayload'] = 'Max payload seems unrealistic (>1000kg)'
    }

    if (formData.configuration.reach <= 0) {
      newErrors['configuration.reach'] = 'Reach must be greater than 0'
    } else if (formData.configuration.reach > 10000) {
      newErrors['configuration.reach'] = 'Reach seems unrealistic (>10m)'
    }

    if (formData.configuration.joints < 3 || formData.configuration.joints > 12) {
      newErrors['configuration.joints'] = 'Joints must be between 3 and 12'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const fillDemoData = () => {
    const demoData: RobotFormData = {
      name: 'Demo Robot UR5e',
      vendor: 'universal_robots',
      model: 'UR5e',
      serialNumber: `UR5E-${Date.now().toString().slice(-8)}`,
      firmwareVersion: '5.11.0',
      location: {
        facility: 'Assembly Line 1',
        cell: 'Cell A-3',
      },
      configuration: {
        maxPayload: 5,
        reach: 850,
        joints: 6,
      },
    }
    setFormData(demoData)
    setErrors({})
    toast.success('Demo data filled! Click "Create Robot" to add it.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors shown below')
      return
    }

    if (!urfmp) {
      toast.error('URFMP client not initialized')
      return
    }

    setIsLoading(true)
    try {
      const robot = await urfmp.createRobot(formData)
      console.log('✅ Robot created successfully:', robot)
      toast.success(`Robot "${formData.name}" created successfully!`)
      onSuccess(true) // Force refresh to bypass rate limiting
      onClose()
      // Reset form
      setErrors({})
      setFormData({
        name: '',
        vendor: '',
        model: '',
        serialNumber: '',
        firmwareVersion: '',
        location: {
          facility: '',
          cell: '',
        },
        configuration: {
          maxPayload: 0,
          reach: 0,
          joints: 6,
        },
      })
    } catch (error: any) {
      console.error('❌ Failed to create robot:', error)
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Failed to create robot'
      toast.error(errorMessage)

      // If there are field-specific errors from the API, show them
      if (error.response?.data?.error?.details) {
        setErrors(error.response.data.error.details)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof RobotFormData] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const getInputClassName = (fieldName: string) => {
    const baseClass =
      'w-full rounded-md border px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 min-h-[44px]'
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[90] p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Add New Robot</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Validation Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                    {Object.entries(errors).map(([field, error]) => (
                      <li key={field}>
                        <strong>{field.replace(/\./g, ' > ')}:</strong> {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Demo Data Button */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                  Quick Start
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Not sure what to enter? Click the button to fill the form with sample robot data.
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemoData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Sparkles className="h-4 w-4" />
                Fill Demo Data
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={getInputClassName('name')}
                  placeholder="e.g., Production Line Robot #1"
                />
                {renderFieldError('name')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vendor *</label>
                <select
                  required
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  className={getInputClassName('vendor')}
                >
                  <option value="">Select vendor</option>
                  <option value="universal_robots">Universal Robots</option>
                  <option value="kuka">KUKA</option>
                  <option value="abb">ABB</option>
                  <option value="fanuc">FANUC</option>
                  <option value="yaskawa">Yaskawa</option>
                  <option value="doosan">Doosan</option>
                  <option value="techman">Techman</option>
                  <option value="custom">Custom</option>
                </select>
                {renderFieldError('vendor')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className={getInputClassName('model')}
                  placeholder="e.g., UR5e, KR 10 R1100"
                />
                {renderFieldError('model')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number *</label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className={getInputClassName('serialNumber')}
                  placeholder="e.g., UR5E-12345678"
                />
                {renderFieldError('serialNumber')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Firmware Version *</label>
                <input
                  type="text"
                  required
                  value={formData.firmwareVersion}
                  onChange={(e) => handleInputChange('firmwareVersion', e.target.value)}
                  className={getInputClassName('firmwareVersion')}
                  placeholder="e.g., 5.11.0"
                />
                {renderFieldError('firmwareVersion')}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facility *</label>
                <input
                  type="text"
                  required
                  value={formData.location.facility}
                  onChange={(e) => handleInputChange('location.facility', e.target.value)}
                  className={getInputClassName('location.facility')}
                  placeholder="e.g., Assembly Line 1"
                />
                {renderFieldError('location.facility')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cell/Station *</label>
                <input
                  type="text"
                  required
                  value={formData.location.cell}
                  onChange={(e) => handleInputChange('location.cell', e.target.value)}
                  className={getInputClassName('location.cell')}
                  placeholder="e.g., Cell A-3"
                />
                {renderFieldError('location.cell')}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Payload (kg) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  required
                  value={formData.configuration.maxPayload}
                  onChange={(e) =>
                    handleInputChange('configuration.maxPayload', Number(e.target.value))
                  }
                  className={getInputClassName('configuration.maxPayload')}
                  placeholder="e.g., 5"
                />
                {renderFieldError('configuration.maxPayload')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reach (mm) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.configuration.reach}
                  onChange={(e) => handleInputChange('configuration.reach', Number(e.target.value))}
                  className={getInputClassName('configuration.reach')}
                  placeholder="e.g., 850"
                />
                {renderFieldError('configuration.reach')}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Joints *</label>
                <input
                  type="number"
                  min="3"
                  max="12"
                  required
                  value={formData.configuration.joints}
                  onChange={(e) =>
                    handleInputChange('configuration.joints', Number(e.target.value))
                  }
                  className={getInputClassName('configuration.joints')}
                  placeholder="e.g., 6"
                />
                {renderFieldError('configuration.joints')}
              </div>
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
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Robot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
