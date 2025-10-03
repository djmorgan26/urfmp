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
  blue: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/30',
  green: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-950/30',
  red: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-950/30',
  yellow: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/30',
}

export function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && <p className="text-sm text-muted-foreground mt-1">{trend}</p>}
        </div>

        <div
          className={cn(
            'h-12 w-12 rounded-lg flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
