import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useURFMP } from '@/hooks/useURFMP'

interface AddRobotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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
    } else if (!/^[A-Z0-9\-]{6,20}$/i.test(formData.serialNumber)) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the validation errors')
      return
    }

    if (!urfmp) {
      toast.error('URFMP client not initialized')
      return
    }

    setIsLoading(true)
    try {
      await urfmp.createRobot(formData)
      toast.success('Robot created successfully!')
      onSuccess()
      onClose()
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
      console.error('Failed to create robot:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to create robot')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select vendor</option>
                  <option value="Universal Robots">Universal Robots</option>
                  <option value="KUKA">KUKA</option>
                  <option value="ABB">ABB</option>
                  <option value="FANUC">FANUC</option>
                  <option value="Yaskawa">Yaskawa</option>
                  <option value="Kawasaki">Kawasaki</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., UR5e, KR 10 R1100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., UR-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Firmware Version</label>
                <input
                  type="text"
                  value={formData.firmwareVersion}
                  onChange={(e) => handleInputChange('firmwareVersion', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 5.9.1, 8.7.1"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Facility</label>
                <input
                  type="text"
                  value={formData.location.facility}
                  onChange={(e) => handleInputChange('location.facility', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Assembly Line, Warehouse"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cell/Station</label>
                <input
                  type="text"
                  value={formData.location.cell}
                  onChange={(e) => handleInputChange('location.cell', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., Cell-A1, Station-3"
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Max Payload (kg)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.configuration.maxPayload}
                  onChange={(e) =>
                    handleInputChange('configuration.maxPayload', Number(e.target.value))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 5, 10, 20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reach (mm)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.configuration.reach}
                  onChange={(e) => handleInputChange('configuration.reach', Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 850, 1300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Joints</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.configuration.joints}
                  onChange={(e) =>
                    handleInputChange('configuration.joints', Number(e.target.value))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g., 6, 7"
                />
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
