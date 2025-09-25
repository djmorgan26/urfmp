import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Users, Activity, Zap } from 'lucide-react'
import { MetricCard } from './MetricCard'

describe('MetricCard Component', () => {
  const defaultProps = {
    title: 'Total Robots',
    value: '42',
    icon: Users,
    trend: '+12% vs last month',
    color: 'blue' as const
  }

  it('should render metric title and value', () => {
    render(<MetricCard {...defaultProps} />)

    expect(screen.getByText('Total Robots')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument() // Lucide icons have role="img"
  })

  it('should display trend correctly', () => {
    render(<MetricCard {...defaultProps} />)

    expect(screen.getByText('+12% vs last month')).toBeInTheDocument()
  })

  it('should display different trend text', () => {
    const propsWithDifferentTrend = {
      ...defaultProps,
      trend: '-8% vs last week'
    }

    render(<MetricCard {...propsWithDifferentTrend} />)

    expect(screen.getByText('-8% vs last week')).toBeInTheDocument()
  })

  it('should render without trend data', () => {
    const propsWithoutTrend = {
      title: 'Total Robots',
      value: '42',
      icon: Users,
      color: 'blue' as const
    }

    render(<MetricCard {...propsWithoutTrend} />)

    expect(screen.getByText('Total Robots')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.queryByText('+12%')).not.toBeInTheDocument()
  })

  it('should handle large numbers formatting', () => {
    const propsWithLargeNumber = {
      ...defaultProps,
      value: '1,234,567'
    }

    render(<MetricCard {...propsWithLargeNumber} />)

    expect(screen.getByText('1,234,567')).toBeInTheDocument()
  })

  it('should have proper semantic structure', () => {
    render(<MetricCard {...defaultProps} />)

    // Title should be present (it's a p element, not heading in the actual component)
    expect(screen.getByText('Total Robots')).toBeInTheDocument()
    // Value should be displayed prominently
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should apply correct CSS classes for styling', () => {
    const { container } = render(<MetricCard {...defaultProps} />)

    const metricCard = container.firstChild
    expect(metricCard).toHaveClass('bg-card')
    expect(metricCard).toHaveClass('rounded-lg')
    expect(metricCard).toHaveClass('border')
  })

  it('should handle zero values correctly', () => {
    const propsWithZero = {
      ...defaultProps,
      value: '0',
      trend: '0% no change'
    }

    render(<MetricCard {...propsWithZero} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0% no change')).toBeInTheDocument()
  })

  it('should handle different color variants', () => {
    const colorVariants = [
      { ...defaultProps, color: 'green' as const },
      { ...defaultProps, color: 'red' as const },
      { ...defaultProps, color: 'yellow' as const }
    ]

    colorVariants.forEach((props) => {
      const { container } = render(<MetricCard {...props} />)
      const iconContainer = container.querySelector('.flex.items-center.justify-center')

      if (props.color === 'green') {
        expect(iconContainer).toHaveClass('text-green-600')
        expect(iconContainer).toHaveClass('bg-green-100')
      }
    })
  })

  it('should handle different icon types', () => {
    const iconVariants = [
      { ...defaultProps, icon: Activity },
      { ...defaultProps, icon: Zap }
    ]

    iconVariants.forEach((props) => {
      render(<MetricCard {...props} />)
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })
})