import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export interface DateRange {
  from: Date
  to: Date
  label: string
}

export interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: DateRange[]
  className?: string
}

const DEFAULT_PRESETS: DateRange[] = [
  {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 7 days',
  },
  {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 30 days',
  },
  {
    from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last 90 days',
  },
  {
    from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: 'Last year',
  },
  {
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
    label: 'This month',
  },
  {
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    label: 'Last month',
  },
]

export function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMode, setCustomMode] = useState(false)
  const [tempRange, setTempRange] = useState(value)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setCustomMode(false)
        setTempRange(value)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [value])

  const formatDateRange = (range: DateRange) => {
    if (range.label) return range.label
    return `${range.from.toLocaleDateString()} - ${range.to.toLocaleDateString()}`
  }

  const handlePresetSelect = (preset: DateRange) => {
    onChange(preset)
    setIsOpen(false)
    setCustomMode(false)
  }

  const handleCustomSubmit = () => {
    onChange({
      ...tempRange,
      label: `${tempRange.from.toLocaleDateString()} - ${tempRange.to.toLocaleDateString()}`,
    })
    setIsOpen(false)
    setCustomMode(false)
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors min-w-[200px] justify-between"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">{formatDateRange(value)}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-4">
            {!customMode ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Select</h4>
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
                <div className="border-t border-border pt-2 mt-2">
                  <button
                    onClick={() => setCustomMode(true)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors text-blue-600"
                  >
                    Custom Range...
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Custom Date Range</h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">From</label>
                    <input
                      type="date"
                      value={formatDateForInput(tempRange.from)}
                      onChange={(e) =>
                        setTempRange((prev) => ({
                          ...prev,
                          from: new Date(e.target.value),
                        }))
                      }
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground">To</label>
                    <input
                      type="date"
                      value={formatDateForInput(tempRange.to)}
                      onChange={(e) =>
                        setTempRange((prev) => ({
                          ...prev,
                          to: new Date(e.target.value),
                        }))
                      }
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setCustomMode(false)
                      setTempRange(value)
                    }}
                    className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCustomSubmit}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
