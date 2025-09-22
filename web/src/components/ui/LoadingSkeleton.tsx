import { cn } from '../../utils/cn'

interface LoadingSkeletonProps {
  className?: string
}

interface LoadingCardProps {
  className?: string
  rows?: number
}

interface LoadingTableProps {
  columns?: number
  rows?: number
  className?: string
}

interface LoadingChartProps {
  className?: string
  height?: number
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded', className)} />
}

export function LoadingCard({ className, rows = 3 }: LoadingCardProps) {
  return (
    <div className={cn('p-4 border border-border rounded-lg space-y-3', className)}>
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-3/4" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>

      {/* Content rows */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-3">
            <LoadingSkeleton className="h-3 w-full" />
            <LoadingSkeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoadingTable({ columns = 4, rows = 5, className }: LoadingTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Table Header */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} className="h-3 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function LoadingChart({ className, height = 200 }: LoadingChartProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Chart title */}
      <LoadingSkeleton className="h-4 w-48" />

      {/* Chart area */}
      <div className="relative" style={{ height: `${height}px` }}>
        <LoadingSkeleton className="w-full h-full" />

        {/* Simulated chart elements */}
        <div className="absolute inset-4 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-end space-x-2 h-6">
              {Array.from({ length: 8 }).map((_, j) => (
                <LoadingSkeleton
                  key={j}
                  className="flex-1"
                  style={{ height: `${Math.random() * 100 + 20}%` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex space-x-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <LoadingSkeleton className="h-3 w-3 rounded-full" />
            <LoadingSkeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoadingButton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      <span>Loading...</span>
    </div>
  )
}

export function LoadingSpinner({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full',
        className
      )}
    />
  )
}

export function LoadingDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <LoadingSkeleton className="h-8 w-64" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} rows={1} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingChart height={300} />
        <LoadingChart height={300} />
      </div>

      {/* Table Section */}
      <div className="border border-border rounded-lg p-4">
        <LoadingSkeleton className="h-6 w-48 mb-4" />
        <LoadingTable columns={5} rows={8} />
      </div>
    </div>
  )
}
