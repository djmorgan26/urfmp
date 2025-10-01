import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { validateEmail, validatePassword } from '../lib/auth'
import { PasswordStrengthIndicator } from '../components/auth/PasswordStrengthIndicator'

export function Signup() {
  const navigate = useNavigate()
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, authLoading, navigate])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0] || 'Password does not meet requirements'
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required'
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange =
    (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: e.target.value })
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined })
      }
    }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
      })

      // Navigation will be handled by useEffect after isAuthenticated changes
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-muted-foreground">Get started with URFMP in seconds</p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange('firstName')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    errors.firstName ? 'border-red-500' : 'border-input'
                  )}
                  placeholder="John"
                  autoComplete="given-name"
                  autoFocus
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange('lastName')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    errors.lastName ? 'border-red-500' : 'border-input'
                  )}
                  placeholder="Doe"
                  autoComplete="family-name"
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200',
                  errors.email ? 'border-red-500' : 'border-input'
                )}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Organization Field */}
            <div className="space-y-2">
              <label htmlFor="organizationName" className="text-sm font-medium">
                Organization Name
              </label>
              <input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={handleChange('organizationName')}
                className={cn(
                  'w-full px-4 py-3 rounded-lg border bg-background',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-all duration-200',
                  errors.organizationName ? 'border-red-500' : 'border-input'
                )}
                placeholder="Acme Robotics Inc."
                autoComplete="organization"
                disabled={isLoading}
              />
              {errors.organizationName && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.organizationName}</p>
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
                  value={formData.password}
                  onChange={handleChange('password')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background pr-12',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    errors.password ? 'border-red-500' : 'border-input'
                  )}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
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
                <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>
              )}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border bg-background pr-12',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                    'transition-all duration-200',
                    errors.confirmPassword ? 'border-red-500' : 'border-input'
                  )}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked)
                    if (errors.terms) setErrors({ ...errors, terms: undefined })
                  }}
                  className={cn(
                    'w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-2 focus:ring-primary cursor-pointer',
                    errors.terms && 'border-red-500'
                  )}
                  disabled={isLoading}
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="text-xs text-red-600 dark:text-red-400">{errors.terms}</p>
              )}
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
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:underline font-medium"
              tabIndex={isLoading ? -1 : 0}
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
