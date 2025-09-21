import { useState, useRef, useEffect } from 'react'
import { Download, FileText, Settings, ChevronDown, Clock } from 'lucide-react'
import {
  REPORT_TEMPLATES,
  ReportTemplate,
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
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [customSections, setCustomSections] = useState<string[]>([])
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
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
    if (!selectedTemplate && customSections.length === 0) {
      alert('Please select a template or custom sections')
      return
    }

    setIsGenerating(true)

    try {
      const exportData: ExportData = {
        fleetMetrics: analyticsData.fleetMetrics,
        robotPerformance: analyticsData.robotPerformance,
        fleetTrends: analyticsData.fleetTrends,
        errorDistribution: analyticsData.errorDistribution,
        generatedAt: new Date().toISOString(),
        timeRange,
        reportType: selectedTemplate?.name || 'Custom Report'
      }

      let content: string | Blob
      let filename: string

      switch (format) {
        case 'csv':
          content = exportToCSV(exportData)
          filename = generateFilename(
            selectedTemplate?.id || 'custom',
            'csv',
            timeRange.replace(' ', '-').toLowerCase()
          )
          downloadFile(content, filename, 'text/csv')
          break

        case 'json':
          content = exportToJSON(exportData)
          filename = generateFilename(
            selectedTemplate?.id || 'custom',
            'json',
            timeRange.replace(' ', '-').toLowerCase()
          )
          downloadFile(content, filename, 'application/json')
          break

        case 'pdf':
          content = await exportToPDF(exportData, selectedTemplate?.id)
          filename = generateFilename(
            selectedTemplate?.id || 'custom',
            'pdf',
            timeRange.replace(' ', '-').toLowerCase()
          )
          downloadFile(content, filename, 'application/pdf')
          break
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
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

  const availableSections = [
    { id: 'fleet-metrics', label: 'Fleet Metrics' },
    { id: 'robot-performance', label: 'Robot Performance' },
    { id: 'fleet-trends', label: 'Fleet Trends' },
    { id: 'error-distribution', label: 'Error Distribution' },
    { id: 'health-scores', label: 'Health Scores' },
    { id: 'maintenance-alerts', label: 'Maintenance Alerts' },
    { id: 'power-trends', label: 'Power Trends' },
    { id: 'recommendations', label: 'AI Recommendations' }
  ]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Quick Export Buttons */}
        <button
          onClick={() => handleQuickExport('csv')}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>CSV</span>
        </button>

        <button
          onClick={() => handleQuickExport('json')}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-3 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>JSON</span>
        </button>

        {/* Advanced Report Generator */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          <span>Generate Report</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-96 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Generate Report</h4>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              {/* Report Templates */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Report Template
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className={`w-full text-left p-3 border rounded-md transition-colors ${
                      !selectedTemplate ? 'border-blue-500 bg-blue-50' : 'border-input hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">Custom Report</div>
                    <div className="text-xs text-muted-foreground">Select your own sections</div>
                  </button>

                  {REPORT_TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`w-full text-left p-3 border rounded-md transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-input hover:bg-muted'
                      }`}
                    >
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Sections (only shown when custom report is selected) */}
              {!selectedTemplate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Report Sections
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableSections.map(section => (
                      <label key={section.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={customSections.includes(section.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomSections(prev => [...prev, section.id])
                            } else {
                              setCustomSections(prev => prev.filter(id => id !== section.id))
                            }
                          }}
                          className="rounded border-input"
                        />
                        <span>{section.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Export Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'csv' | 'json' | 'pdf')}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="csv">CSV (Comma Separated Values)</option>
                  <option value="json">JSON (JavaScript Object Notation)</option>
                  <option value="pdf">PDF (Portable Document Format)</option>
                </select>
              </div>

              {/* Scheduling (placeholder for future implementation) */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Scheduled Reports (Coming Soon)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Set up automatic report generation and email delivery.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-border">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm border border-input rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={isGenerating || (!selectedTemplate && customSections.length === 0)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Generate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}