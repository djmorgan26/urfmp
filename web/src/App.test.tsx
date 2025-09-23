import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'

// Mock the theme context for testing
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </BrowserRouter>
)

describe('App Component', () => {
  it('renders without crashing', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Basic smoke test - check if app renders
    expect(document.body).toBeTruthy()
  })

  it('has URFMP branding', () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    )

    // Look for URFMP text content
    expect(document.body.textContent).toContain('URFMP')
  })
})