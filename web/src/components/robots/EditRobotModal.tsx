import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useURFMP } from '@/hooks/useURFMP'
import { Robot } from '@urfmp/types'

interface EditRobotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  robot: Robot
}

interface EditRobotFormData {
  name: string
  vendor: string
  model: string
  serialNumber: string
  firmwareVersion: string
  status: string
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

export function EditRobotModal({ isOpen, onClose, onSuccess, robot }: EditRobotModalProps) {
  const { urfmp } = useURFMP()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<EditRobotFormData>({
    name: '',
    vendor: '',
    model: '',
    serialNumber: '',
    firmwareVersion: '',
    status: 'offline',
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

  // Initialize form with robot data
  useEffect(() => {
    if (robot) {
      setFormData({
        name: robot.name || '',
        vendor: robot.vendor || '',
        model: robot.model || '',
        serialNumber: robot.serialNumber || '',
        firmwareVersion: robot.firmwareVersion || '',
        status: robot.status || 'offline',
        location: {
          facility: robot.location?.facility || '',
          cell: robot.location?.cell || '',
        },
        configuration: {
          maxPayload: robot.configuration?.maxPayload || 0,
          reach: robot.configuration?.reach || 0,
          joints: robot.configuration?.joints || 6,
        },
      })
    }
  }, [robot])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!urfmp || !robot) {
      toast.error('URFMP client not initialized')
      return
    }

    setIsLoading(true)
    try {
      await urfmp.updateRobot(robot.id, formData)
      toast.success('Robot updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update robot:', error)
      toast.error(error.response?.data?.error?.message || 'Failed to update robot')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof EditRobotFormData] as any),
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Robot</h2>
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
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Firmware Version</label>
                <input
                  type="text"
                  value={formData.firmwareVersion}
                  onChange={(e) => handleInputChange('firmwareVersion', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="running">Running</option>
                  <option value="idle">Idle</option>
                  <option value="error">Error</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="stopped">Stopped</option>
                </select>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cell/Station</label>
                <input
                  type="text"
                  value={formData.location.cell}
                  onChange={(e) => handleInputChange('location.cell', e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Update Robot</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
