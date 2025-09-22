# Loading States & Error Handling Guide

This guide explains how to use the standardized loading and error components in URFMP.

## 🔄 Loading Components

### LoadingSkeleton
Basic skeleton for any content:
```tsx
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

<LoadingSkeleton className="h-4 w-48" />
```

### LoadingCard
For card-like content:
```tsx
import { LoadingCard } from '@/components/ui/LoadingSkeleton'

<LoadingCard rows={3} />
```

### LoadingTable
For data tables:
```tsx
import { LoadingTable } from '@/components/ui/LoadingSkeleton'

<LoadingTable columns={5} rows={8} />
```

### LoadingChart
For analytics charts:
```tsx
import { LoadingChart } from '@/components/ui/LoadingSkeleton'

<LoadingChart height={300} />
```

### LoadingSpinner
Inline spinner for buttons:
```tsx
import { LoadingSpinner, LoadingButton } from '@/components/ui/LoadingSkeleton'

// In button
<button disabled={isLoading}>
  {isLoading ? <LoadingSpinner className="mr-2" /> : <Save />}
  Save
</button>

// Pre-built loading button content
<LoadingButton />
```

### LoadingDashboard
Full page loading state:
```tsx
import { LoadingDashboard } from '@/components/ui/LoadingSkeleton'

{isLoading ? <LoadingDashboard /> : <DashboardContent />}
```

## ⚠️ Error Handling Components

### ErrorBoundary
Wrap components to catch JavaScript errors:
```tsx
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### ErrorState
For API/data loading errors:
```tsx
import { ErrorState } from '@/components/ui/ErrorBoundary'

<ErrorState
  title="Failed to load robots"
  message="Unable to fetch robot data from the server."
  onRetry={retryFunction}
/>
```

### NetworkError
For network connectivity issues:
```tsx
import { NetworkError } from '@/components/ui/ErrorBoundary'

<NetworkError onRetry={retryFunction} />
```

### EmptyState
For when there's no data:
```tsx
import { EmptyState } from '@/components/ui/ErrorBoundary'
import { Bot } from 'lucide-react'

<EmptyState
  title="No robots found"
  message="Add your first robot to get started."
  icon={<Bot className="h-8 w-8 text-gray-400" />}
  action={
    <button onClick={addRobot}>
      Add Robot
    </button>
  }
/>
```

## 🔧 Implementation Patterns

### Data Fetching Pattern
```tsx
function RobotList() {
  const { robots, isLoading, error, retry } = useRobots()

  if (isLoading) return <LoadingTable columns={4} rows={6} />
  if (error) return <ErrorState onRetry={retry} />
  if (robots.length === 0) return <EmptyState title="No robots found" />

  return <RobotTable robots={robots} />
}
```

### Form Submission Pattern
```tsx
function AddRobotModal() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner className="mr-2" /> : <Plus className="mr-2" />}
        {isSubmitting ? 'Creating...' : 'Create Robot'}
      </button>
    </form>
  )
}
```

### Dashboard Pattern
```tsx
function Dashboard() {
  const { data, isLoading, error } = useDashboardData()

  return (
    <ErrorBoundary>
      {isLoading ? (
        <LoadingDashboard />
      ) : error ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <DashboardContent data={data} />
      )}
    </ErrorBoundary>
  )
}
```

## 📱 Components to Update

### Priority 1 (Critical)
- [ ] **GeofencingDashboard** - Add loading states for CRUD operations
- [ ] **PredictiveMaintenanceDashboard** - Add loading for AI predictions
- [ ] **ReportGenerator** - Better loading feedback for exports
- [ ] **Analytics page** - Loading states for chart data

### Priority 2 (High)
- [ ] **Robot list/detail pages** - Consistent loading patterns
- [ ] **Maintenance calendar** - Loading for schedule data
- [ ] **User management** - Loading for invite/edit operations
- [ ] **Settings forms** - Loading states for save operations

### Priority 3 (Medium)
- [ ] **Search results** - Loading state in header search
- [ ] **Navigation** - Loading states for page transitions
- [ ] **Alerts/notifications** - Loading for real-time data

## 🎨 Styling Notes

- All loading components use `animate-pulse` for consistent animation
- Colors automatically adapt to light/dark themes
- Loading skeletons match the shape of actual content
- Error states follow the same design patterns as the rest of the app

## 🚀 Quick Migration

To update existing components:

1. **Replace custom loading indicators:**
   ```tsx
   // Old
   {isLoading && <div>Loading...</div>}

   // New
   {isLoading && <LoadingCard />}
   ```

2. **Add error handling:**
   ```tsx
   // Old
   {error && <div>Error: {error.message}</div>}

   // New
   {error && <ErrorState onRetry={retry} />}
   ```

3. **Wrap with error boundary:**
   ```tsx
   // Add to component tree
   <ErrorBoundary>
     <YourComponent />
   </ErrorBoundary>
   ```

This standardization ensures consistent UX across all URFMP components and makes the app feel more polished and professional.