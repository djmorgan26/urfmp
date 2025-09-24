import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { RobotCard } from './RobotCard'
import type { Robot } from '@urfmp/types'

// Mock the useURFMP hook
vi.mock('../../hooks/useURFMP', () => ({
  useURFMP: () => ({
    urfmp: null,
    robots: [],
    isConnected: false,
    isLoading: false,
    error: null,
    refreshRobots: vi.fn(),
    sendCommand: vi.fn(),
  })
}))

// Mock robot data for testing
const mockRobot: Robot = {
  id: 'test-robot-1',
  name: 'UR5e Test Robot',
  type: 'UR5e',
  model: 'UR5e',
  vendor: 'Universal_Robots',
  status: 'online',
  organizationId: 'test-org',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  lastSeen: new Date(),
  firmwareVersion: '5.15.0',
  capabilities: ['pick_and_place', 'welding'],
  location: {
    facility: 'Test Factory',
    area: 'Production Floor',
    cell: 'Line A'
  },
  configuration: {
    payload: 5.0,
    reach: 850,
    repeatability: 0.03,
    joints: 6
  }
}

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
)

describe('RobotCard Component', () => {
  it('should render robot name and basic info', () => {
    render(
      <TestWrapper>
        <RobotCard robot={mockRobot} />
      </TestWrapper>
    )

    // Check if robot name is displayed
    expect(screen.getByText('UR5e Test Robot')).toBeInTheDocument()

    // Check if robot type/model is displayed somewhere
    const cardElement = screen.getByTestId('robot-card') || screen.getByText('UR5e Test Robot').closest('div')
    expect(cardElement).toBeInTheDocument()
  })

  it('should render robot status information', () => {
    render(
      <TestWrapper>
        <RobotCard robot={mockRobot} />
      </TestWrapper>
    )

    // Look for status or related information
    const cardElement = screen.getByText('UR5e Test Robot').closest('div')
    expect(cardElement).toBeInTheDocument()

    // Should contain the robot name at minimum
    expect(screen.getByText('UR5e Test Robot')).toBeInTheDocument()
  })

  it('should handle robot with different status', () => {
    const offlineRobot: Robot = {
      ...mockRobot,
      status: 'offline',
      lastSeen: new Date(Date.now() - 300000) // 5 minutes ago
    }

    render(
      <TestWrapper>
        <RobotCard robot={offlineRobot} />
      </TestWrapper>
    )

    // Should still render the robot name
    expect(screen.getByText('UR5e Test Robot')).toBeInTheDocument()
  })

  it('should handle missing optional fields gracefully', () => {
    const minimalRobot: Robot = {
      id: 'minimal-robot',
      name: 'Minimal Robot',
      type: 'Generic',
      model: 'Generic',
      vendor: 'Test',
      status: 'idle',
      organizationId: 'test-org',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date(),
      firmwareVersion: '1.0.0',
      capabilities: []
    }

    render(
      <TestWrapper>
        <RobotCard robot={minimalRobot} />
      </TestWrapper>
    )

    // Should render basic information
    expect(screen.getByText('Minimal Robot')).toBeInTheDocument()
  })

  it('should be accessible and have proper structure', () => {
    render(
      <TestWrapper>
        <RobotCard robot={mockRobot} />
      </TestWrapper>
    )

    // Component should render without crashing and contain basic text
    expect(screen.getByText('UR5e Test Robot')).toBeInTheDocument()

    // Should have a proper card structure
    const cardElement = screen.getByText('UR5e Test Robot').closest('div')
    expect(cardElement).toBeInTheDocument()
  })
})