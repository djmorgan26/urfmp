import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { validateEmail } from '../lib/auth'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate, location])

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login({
        email,
        password,
        rememberMe,
      })

      // Navigation will be handled by useEffect after isAuthenticated changes
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Login failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your URFMP account</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200',
                  errors.email ? 'border-red-500' : 'border-input'
                )}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background pr-12',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    errors.password ? 'border-red-500' : 'border-input'
                  )}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90 active:scale-[0.98]',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary'
              )}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">New to URFMP?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link
              to="/signup"
              className="text-sm text-primary hover:underline font-medium"
              tabIndex={isLoading ? -1 : 0}
            >
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          By signing in, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
