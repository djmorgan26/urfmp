import { Info } from 'lucide-react'
import { isDemoMode } from '../../lib/demo'

/**
 * Persistent banner shown across the whole app when running in demo mode.
 * Makes it unmistakable that the fleet is simulated, not real hardware.
 */
export function DemoBanner() {
  if (!isDemoMode()) return null

  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 text-foreground">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm">
        <Info className="h-4 w-4 shrink-0 text-primary" />
        <span className="font-medium">Demo data — simulated fleet, not live hardware.</span>
        <span className="hidden sm:inline text-muted-foreground">
          Telemetry is generated in your browser; no backend or login required.
        </span>
        <a
          href="https://github.com/djmorgan26/urfmp"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline underline underline-offset-2 hover:text-primary"
        >
          View source
        </a>
      </div>
    </div>
  )
}
