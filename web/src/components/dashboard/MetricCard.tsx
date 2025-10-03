import { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MetricCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: string
  color: 'blue' | 'green' | 'red' | 'yellow'
}

const colorClasses = {
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30',
  green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950/30',
  red: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30',
  yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-950/30',
}

export function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-sm text-muted-foreground mt-1">{trend}</p>}
        </div>

        <div
          className={cn(
            'h-14 w-14 rounded-xl flex items-center justify-center flex-shrink-0',
            colorClasses[color]
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
    </div>
  )
}
