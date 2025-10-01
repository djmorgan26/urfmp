import { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { validatePassword } from '../../lib/auth'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const validation = useMemo(() => validatePassword(password), [password])

  if (!password) {
    return null
  }

  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'weak':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'strong':
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthWidth = () => {
    switch (validation.strength) {
      case 'weak':
        return 'w-1/3'
      case 'medium':
        return 'w-2/3'
      case 'strong':
        return 'w-full'
      default:
        return 'w-0'
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bar */}
      <div className="flex gap-1 h-1">
        <div className="flex-1 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 rounded-full',
              getStrengthColor(),
              getStrengthWidth()
            )}
          />
        </div>
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength:</span>
        <span
          className={cn(
            'font-medium capitalize',
            validation.strength === 'weak' && 'text-red-600 dark:text-red-400',
            validation.strength === 'medium' && 'text-yellow-600 dark:text-yellow-400',
            validation.strength === 'strong' && 'text-green-600 dark:text-green-400'
          )}
        >
          {validation.strength}
        </span>
      </div>

      {/* Error Messages */}
      {validation.errors.length > 0 && (
        <ul className="space-y-1 text-xs text-muted-foreground">
          {validation.errors.map((error, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{error}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Success Message */}
      {validation.isValid && validation.strength === 'strong' && (
        <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
          <span className="text-green-500">✓</span>
          <span>Strong password!</span>
        </p>
      )}
    </div>
  )
}
