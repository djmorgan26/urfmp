import { useState, useRef, useEffect } from 'react'
import { Download, FileText } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'
import {
  ExportData,
  exportToCSV,
  exportToJSON,
  exportToPDF,
  downloadFile,
  generateFilename
} from '../../utils/export'
import { AnalyticsData } from '../../hooks/useAnalytics'

export interface ReportGeneratorProps {
  analyticsData: AnalyticsData
  timeRange: string
  className?: string
}

export function ReportGenerator({
  analyticsData,
  timeRange,
  className = ''
}: ReportGeneratorProps) {
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    try {
      const exportData: ExportData = {
        fleetMetrics: analyticsData.fleetMetrics,
        robotPerformance: analyticsData.robotPerformance,
        fleetTrends: analyticsData.fleetTrends,
        errorDistribution: analyticsData.errorDistribution,
        generatedAt: new Date().toISOString(),
        timeRange,
        reportType: 'Comprehensive Report'
      }

      console.log('Generating report with data:', exportData)

      // Generate PDF report by default
      const content = await exportToPDF(exportData, 'fleet-overview')
      const filename = generateFilename(
        'comprehensive-report',
        'pdf',
        timeRange.replace(' ', '-').toLowerCase()
      )
      downloadFile(content, filename, 'text/html')

      setIsOpen(false)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleQuickExport = async (format: 'csv' | 'json') => {
    setIsGenerating(true)

    try {
      const exportData: ExportData = {
        fleetMetrics: analyticsData.fleetMetrics,
        robotPerformance: analyticsData.robotPerformance,
        fleetTrends: analyticsData.fleetTrends,
        errorDistribution: analyticsData.errorDistribution,
        generatedAt: new Date().toISOString(),
        timeRange,
        reportType: 'Quick Export'
      }

      let content: string
      let filename: string

      if (format === 'csv') {
        content = exportToCSV(exportData)
        filename = generateFilename('quick-export', 'csv', timeRange.replace(' ', '-').toLowerCase())
        downloadFile(content, filename, 'text/csv')
      } else {
        content = exportToJSON(exportData)
        filename = generateFilename('quick-export', 'json', timeRange.replace(' ', '-').toLowerCase())
        downloadFile(content, filename, 'application/json')
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Export Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isGenerating}
        className={cn(
          'p-2 rounded-md transition-colors disabled:opacity-50',
          isDark
            ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
            : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
        )}
        title="Export Data"
      >
        <Download className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-1 w-48 rounded-md shadow-lg z-50 border',
            isDark
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          )}
        >
          <div className="py-1">
            {/* Quick CSV Export */}
            <button
              onClick={() => {
                handleQuickExport('csv')
                setIsOpen(false)
              }}
              disabled={isGenerating}
              className={cn(
                'w-full flex items-center px-4 py-2 text-sm transition-colors disabled:opacity-50',
                isDark
                  ? 'text-gray-200 hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-100'
              )}
            >
              <Download className="h-4 w-4 mr-3" />
              Export as CSV
            </button>

            {/* Quick JSON Export */}
            <button
              onClick={() => {
                handleQuickExport('json')
                setIsOpen(false)
              }}
              disabled={isGenerating}
              className={cn(
                'w-full flex items-center px-4 py-2 text-sm transition-colors disabled:opacity-50',
                isDark
                  ? 'text-gray-200 hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-100'
              )}
            >
              <Download className="h-4 w-4 mr-3" />
              Export as JSON
            </button>

            {/* Divider */}
            <div className={cn('my-1 border-t', isDark ? 'border-gray-700' : 'border-gray-200')} />

            {/* Generate Report */}
            <button
              onClick={() => {
                handleGenerateReport()
                setIsOpen(false)
              }}
              disabled={isGenerating}
              className={cn(
                'w-full flex items-center px-4 py-2 text-sm transition-colors disabled:opacity-50',
                isDark
                  ? 'text-gray-200 hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-100'
              )}
            >
              <FileText className="h-4 w-4 mr-3" />
              Generate Report
            </button>
          </div>

          {isGenerating && (
            <div className={cn('px-4 py-2 border-t text-xs', isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600')}>
              <div className="flex items-center">
                <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full mr-2" />
                Generating...
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}