import { useState } from 'react'
import { X, Key, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'

interface CreateApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateApiKeyModal({ isOpen, onClose }: CreateApiKeyModalProps) {
  const { isDark } = useTheme()
  const [step, setStep] = useState<'form' | 'generated'>('form')
  const [keyName, setKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:robots', 'read:telemetry'])
  const [generatedKey, setGeneratedKey] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const availableScopes = [
    { id: 'read:robots', label: 'Read robot data', description: 'View robot status and information' },
    { id: 'write:robots', label: 'Write robot data', description: 'Create and update robot information' },
    { id: 'delete:robots', label: 'Delete robots', description: 'Remove robots from the system' },
    { id: 'read:telemetry', label: 'Read telemetry', description: 'Access robot telemetry data' },
    { id: 'write:telemetry', label: 'Write telemetry', description: 'Submit telemetry data' },
    { id: 'read:commands', label: 'Read commands', description: 'View robot command history' },
    { id: 'write:commands', label: 'Send commands', description: 'Send commands to robots' },
    { id: 'read:maintenance', label: 'Read maintenance', description: 'View maintenance schedules and tasks' },
    { id: 'write:maintenance', label: 'Write maintenance', description: 'Create and update maintenance tasks' },
  ]

  const handleScopeToggle = (scopeId: string) => {
    setSelectedScopes(prev =>
      prev.includes(scopeId)
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    )
  }

  const generateApiKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a name for your API key')
      return
    }

    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope')
      return
    }

    setIsGenerating(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generate a mock API key
      const timestamp = Date.now().toString(36)
      const random = Math.random().toString(36).substring(2)
      const mockKey = `urfmp_${keyName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}${random}`

      setGeneratedKey(mockKey)
      setStep('generated')
      toast.success('API key generated successfully!')
    } catch (error) {
      toast.error('Failed to generate API key. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedKey)
      setIsCopied(true)
      toast.success('API key copied to clipboard!')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy API key to clipboard')
    }
  }

  const handleClose = () => {
    setStep('form')
    setKeyName('')
    setSelectedScopes(['read:robots', 'read:telemetry'])
    setGeneratedKey('')
    setIsCopied(false)
    setIsGenerating(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

        <div className={cn(
          'relative w-full max-w-md rounded-lg p-6 shadow-lg',
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {step === 'form' ? 'Create API Key' : 'API Key Generated'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-md hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {step === 'form' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  API Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production Dashboard"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Scopes
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableScopes.map((scope) => (
                    <div
                      key={scope.id}
                      className={cn(
                        'flex items-start space-x-3 p-3 rounded-md border cursor-pointer transition-colors',
                        selectedScopes.includes(scope.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted'
                      )}
                      onClick={() => handleScopeToggle(scope.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={() => handleScopeToggle(scope.id)}
                        className="rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{scope.label}</div>
                        <div className="text-xs text-muted-foreground">{scope.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={generateApiKey}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </div>
          )}

          {step === 'generated' && (
            <div className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Important:</strong> This is the only time you'll see this API key.
                  Make sure to copy and store it securely.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-2 bg-muted rounded-md font-mono text-sm break-all">
                    {generatedKey}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className={cn(
                      'p-2 rounded-md border transition-colors',
                      isCopied
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Selected Scopes
                </label>
                <div className="space-y-1">
                  {selectedScopes.map((scopeId) => {
                    const scope = availableScopes.find(s => s.id === scopeId)
                    return (
                      <div key={scopeId} className="text-sm text-muted-foreground">
                        • {scope?.label}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}