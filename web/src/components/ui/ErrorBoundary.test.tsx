import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeEach(() => {
  console.error = vi.fn()
})

afterEach(() => {
  console.error = originalError
})

// Test component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Normal content</div>
}

// Test component that throws during render
const AsyncError = () => {
  throw new Promise((_, reject) => reject(new Error('Async error')))
}

describe('ErrorBoundary Component', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
  })

  it('should display error details in development mode', () => {
    // Mock development environment
    const originalEnv = import.meta.env.MODE
    vi.stubEnv('MODE', 'development')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details:')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    // Restore environment
    vi.stubEnv('MODE', originalEnv)
  })

  it('should hide error details in production mode', () => {
    // Mock production environment
    vi.stubEnv('MODE', 'production')

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText('Error Details:')).not.toBeInTheDocument()
    expect(screen.getByText('An unexpected error occurred. Please try refreshing the page.')).toBeInTheDocument()

    // Restore environment
    vi.unstubAllEnvs()
  })

  it('should reset error state when try again is clicked', () => {
    let shouldThrow = true
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    // Error should be displayed
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Change the component to not throw
    shouldThrow = false
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })

    // Rerender with non-throwing component and click try again
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={shouldThrow} />
      </ErrorBoundary>
    )

    tryAgainButton.click()

    // Should show normal content
    expect(screen.getByText('Normal content')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should accept custom error message', () => {
    const customErrorMessage = 'Custom error occurred'

    render(
      <ErrorBoundary fallback={() => <div>{customErrorMessage}</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(customErrorMessage)).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('should log error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleErrorSpy).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error))

    consoleErrorSpy.mockRestore()
  })

  it('should call onError callback when provided', () => {
    const onErrorCallback = vi.fn()

    render(
      <ErrorBoundary onError={onErrorCallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onErrorCallback).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('should handle different error types', () => {
    const errorTypes = [
      new Error('Standard error'),
      new TypeError('Type error'),
      new ReferenceError('Reference error'),
      'String error'
    ]

    errorTypes.forEach((error, index) => {
      const ErrorComponent = () => {
        throw error
      }

      const { unmount } = render(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      if (typeof error === 'object' && error.message) {
        expect(screen.getByText(error.message)).toBeInTheDocument()
      }

      unmount()
    })
  })

  it('should be accessible with proper ARIA labels', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const errorContainer = screen.getByRole('alert')
    expect(errorContainer).toBeInTheDocument()
    expect(errorContainer).toHaveAttribute('aria-live', 'polite')

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()
    expect(tryAgainButton).toHaveAttribute('type', 'button')
  })

  it('should maintain error boundary isolation', () => {
    render(
      <div>
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
        <div>Sibling content</div>
      </div>
    )

    // Error boundary should catch the error
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    // Sibling content should still render
    expect(screen.getByText('Sibling content')).toBeInTheDocument()
  })
})