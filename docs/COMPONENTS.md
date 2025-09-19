# URFMP Component Library

## Overview

This document outlines the React component structure and design patterns used in the URFMP frontend application.

## Design System

### Theme System
- **Colors**: CSS custom properties with light/dark theme support
- **Typography**: Tailwind typography classes
- **Spacing**: Tailwind spacing scale (0.25rem increments)
- **Border Radius**: Consistent border-radius values
- **Shadows**: Tailwind shadow utilities

### CSS Custom Properties
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... more theme variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme overrides */
}
```

## Layout Components

### Layout (`components/layout/Layout.tsx`)
Main application layout wrapper.

**Features**:
- Header with navigation and user controls
- Sidebar navigation
- Main content area
- Theme toggle integration
- Real-time connection status

**Usage**:
```tsx
<Layout>
  <Routes>
    <Route path="/" element={<Dashboard />} />
    {/* other routes */}
  </Routes>
</Layout>
```

**Header Elements**:
- Company logo and branding
- Global search bar
- Connection status indicator
- Fleet status summary
- Notification bell
- Theme toggle button
- User profile menu

**Sidebar Navigation**:
- Dashboard
- Robots
- Analytics
- Maintenance
- Settings

## Page Components

### Dashboard (`pages/Dashboard.tsx`)
Main dashboard with fleet overview and metrics.

**Current Status**: Basic layout with placeholder widgets

**Planned Features**:
- Fleet status summary cards
- Real-time metrics charts
- Recent activity feed
- Quick action buttons
- Performance indicators

### Robots (`pages/Robots.tsx`)
Robot fleet management interface.

**Current Status**: Basic layout

**Planned Features**:
- Robot list with filtering
- Status indicators
- Bulk operations
- Add/remove robots
- Real-time status updates

### RobotDetail (`pages/RobotDetail.tsx`)
Individual robot details and control interface.

**Current Status**: Basic layout with status display

**Features**:
- Robot information display
- Status visualization
- Control buttons
- Telemetry charts
- Maintenance history

### Settings (`pages/Settings.tsx`)
System configuration interface.

**Current Status**: Complete with tabbed interface

**Tabs**:
- General (theme selection, organization settings)
- Notifications (email, push preferences)
- Security (2FA, session settings)
- API Keys (key management)
- Team (user management)
- Database (retention, backup settings)

### Maintenance (`pages/Maintenance.tsx`)
Maintenance task management.

**Current Status**: Basic layout

**Planned Features**:
- Task scheduling
- Maintenance history
- Cost tracking
- Calendar view

### Analytics (`pages/Analytics.tsx`)
Performance analytics and reporting.

**Current Status**: Basic layout

**Planned Features**:
- Performance charts
- Usage statistics
- Trend analysis
- Export functionality

## Reusable Components

### RobotCard (`components/dashboard/RobotCard.tsx`)
Card component for displaying robot information.

**Props**:
```tsx
interface RobotCardProps {
  robot: Robot
}
```

**Features**:
- Status indicator with color coding
- Robot name and model
- Last seen timestamp
- Quick action buttons
- Status-specific icon display

**Status Configuration**:
```tsx
const statusConfig = {
  online: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  running: { icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100' },
  idle: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' },
  offline: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  error: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  // ... more statuses
}
```

## Utility Components

### cn (`utils/cn.ts`)
Class name utility function for conditional styling.

**Usage**:
```tsx
import { cn } from '@/utils/cn'

<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  'always-applied'
)} />
```

## Hooks

### useURFMP (`hooks/useURFMP.tsx`)
Main application state management hook.

**Features**:
- Robot data management
- WebSocket connection handling
- Real-time updates
- Error handling
- Loading states

**Usage**:
```tsx
const { robots, isConnected, error, sendCommand, refreshRobots } = useURFMP()
```

### useTheme (`contexts/ThemeContext.tsx`)
Theme management hook.

**Features**:
- Light/dark/system theme support
- localStorage persistence
- System preference detection
- Real-time theme switching

**Usage**:
```tsx
const { theme, setTheme, isDark } = useTheme()
```

## Icon System

### Lucide React Icons
Consistent icon library used throughout the application.

**Common Icons**:
- `Activity` - Running/active states
- `Bot` - Robot representation
- `BarChart3` - Analytics
- `Wrench` - Maintenance
- `Settings` - Configuration
- `Bell` - Notifications
- `Sun/Moon` - Theme toggle
- `Search` - Search functionality

**Usage**:
```tsx
import { Activity, Bot } from 'lucide-react'

<Activity className="h-5 w-5" />
```

## Styling Patterns

### Component Structure
```tsx
// Base component with proper TypeScript
interface ComponentProps {
  // Define props with types
}

export function Component({ prop }: ComponentProps) {
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  )
}
```

### Conditional Styling
```tsx
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  variant === 'primary' && 'primary-classes'
)} />
```

### State-based Styling
```tsx
const statusClasses = {
  success: 'text-green-600 bg-green-100',
  error: 'text-red-600 bg-red-100',
  warning: 'text-yellow-600 bg-yellow-100'
}

<span className={statusClasses[status]} />
```

## Responsive Design

### Breakpoints (Tailwind)
- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### Mobile-First Approach
```tsx
<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
">
  {/* Responsive grid */}
</div>
```

## Accessibility

### Best Practices
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast compliance

### Examples
```tsx
<button
  aria-label="Toggle dark mode"
  title="Switch to dark mode"
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  <Moon className="h-5 w-5" />
</button>
```

## Animation & Transitions

### Tailwind Transitions
```tsx
<div className="transition-colors duration-200 hover:bg-accent">
  Hover me
</div>
```

### Loading States
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
</div>
```

## Form Components

### Input Patterns
```tsx
<input
  type="text"
  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
  placeholder="Enter value..."
/>
```

### Select Patterns
```tsx
<select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### Button Patterns
```tsx
// Primary button
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 border border-border rounded-md hover:bg-accent">
  Secondary Action
</button>
```

## Data Display Components

### Cards
```tsx
<div className="bg-card rounded-lg border border-border p-6">
  <h3 className="text-lg font-semibold mb-4">Card Title</h3>
  {/* Card content */}
</div>
```

### Tables
```tsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left p-4">Header</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-border hover:bg-muted/50">
        <td className="p-4">Cell content</td>
      </tr>
    </tbody>
  </table>
</div>
```

## Testing Patterns

### Component Testing
```tsx
import { render, screen } from '@testing-library/react'
import { Component } from './Component'

test('renders component correctly', () => {
  render(<Component prop="value" />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

## Performance Considerations

### Code Splitting
```tsx
import { lazy, Suspense } from 'react'

const LazyComponent = lazy(() => import('./LazyComponent'))

<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Memoization
```tsx
import { memo, useMemo } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return expensiveOperation(data)
  }, [data])

  return <div>{processedData}</div>
})
```

## Future Components

### To Be Implemented
- Loading spinners and skeletons
- Modal and dialog components
- Toast notification system
- Chart and graph components
- Data visualization widgets
- Form validation components
- File upload components
- Date/time pickers

---

*This component library will grow as new features are implemented*