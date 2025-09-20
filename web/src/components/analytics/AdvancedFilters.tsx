import { useState, useRef, useEffect } from 'react'
import { Filter, X, Check, ChevronDown } from 'lucide-react'

export interface FilterOption {
  id: string
  label: string
  value: string | number
  category?: string
}

export interface FilterGroup {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'checkbox'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
}

export interface ActiveFilter {
  groupId: string
  groupLabel: string
  values: (string | number)[]
  displayValue: string
}

export interface AdvancedFiltersProps {
  filterGroups: FilterGroup[]
  activeFilters: ActiveFilter[]
  onFiltersChange: (filters: ActiveFilter[]) => void
  className?: string
}

export function AdvancedFilters({
  filterGroups,
  activeFilters,
  onFiltersChange,
  className = ''
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempFilters, setTempFilters] = useState(activeFilters)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setTempFilters(activeFilters)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeFilters])

  const handleFilterChange = (groupId: string, values: (string | number)[], displayValue: string) => {
    const group = filterGroups.find(g => g.id === groupId)
    if (!group) return

    setTempFilters(prev => {
      const filtered = prev.filter(f => f.groupId !== groupId)
      if (values.length > 0) {
        filtered.push({
          groupId,
          groupLabel: group.label,
          values,
          displayValue
        })
      }
      return filtered
    })
  }

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    setTempFilters([])
    onFiltersChange([])
    setIsOpen(false)
  }

  const removeFilter = (groupId: string) => {
    const newFilters = activeFilters.filter(f => f.groupId !== groupId)
    onFiltersChange(newFilters)
  }

  const getFilterValue = (groupId: string) => {
    return tempFilters.find(f => f.groupId === groupId)?.values || []
  }

  const renderFilterControl = (group: FilterGroup) => {
    const currentValues = getFilterValue(group.id)

    switch (group.type) {
      case 'select':
        return (
          <select
            value={currentValues[0] || ''}
            onChange={(e) => {
              const value = e.target.value
              const option = group.options?.find(o => o.value.toString() === value)
              handleFilterChange(
                group.id,
                value ? [value] : [],
                option?.label || value
              )
            }}
            className="w-full px-3 py-2 border border-input rounded-md text-sm"
          >
            <option value="">All</option>
            {group.options?.map(option => (
              <option key={option.id} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {group.options?.map(option => (
              <label key={option.id} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={currentValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value)

                    const labels = newValues.map(v =>
                      group.options?.find(o => o.value === v)?.label || v.toString()
                    )

                    handleFilterChange(
                      group.id,
                      newValues,
                      labels.length > 0 ? labels.join(', ') : ''
                    )
                  }}
                  className="rounded border-input"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        )

      case 'range':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={currentValues[0] || ''}
                onChange={(e) => {
                  const min = e.target.value ? parseFloat(e.target.value) : undefined
                  const max = currentValues[1] as number | undefined
                  const values = [min, max].filter(v => v !== undefined) as number[]
                  const displayValue = values.length === 2
                    ? `${values[0]} - ${values[1]}`
                    : values.length === 1
                    ? `≥ ${values[0]}`
                    : ''
                  handleFilterChange(group.id, values, displayValue)
                }}
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                min={group.min}
                max={group.max}
                step={group.step}
              />
              <input
                type="number"
                placeholder="Max"
                value={currentValues[1] || ''}
                onChange={(e) => {
                  const min = currentValues[0] as number | undefined
                  const max = e.target.value ? parseFloat(e.target.value) : undefined
                  const values = [min, max].filter(v => v !== undefined) as number[]
                  const displayValue = values.length === 2
                    ? `${values[0]} - ${values[1]}`
                    : values.length === 1
                    ? `≤ ${values[1]}`
                    : ''
                  handleFilterChange(group.id, values, displayValue)
                }}
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
                min={group.min}
                max={group.max}
                step={group.step}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filter</span>
          {activeFilters.length > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilters.length}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <div className="flex items-center space-x-2 flex-wrap">
            {activeFilters.map(filter => (
              <div
                key={filter.groupId}
                className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs"
              >
                <span>{filter.groupLabel}: {filter.displayValue}</span>
                <button
                  onClick={() => removeFilter(filter.groupId)}
                  className="hover:bg-blue-200 rounded p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-96 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Advanced Filters</h4>
              <button
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {filterGroups.map(group => (
                <div key={group.id} className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {group.label}
                  </label>
                  {renderFilterControl(group)}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setTempFilters(activeFilters)
                }}
                className="px-3 py-1.5 text-sm border border-input rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}