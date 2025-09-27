# URFMP Manual Test Checklist

This comprehensive manual test checklist ensures all functionality works as intended. This checklist can be used for:

- Pre-deployment validation
- Post-deployment verification
- CI/CD manual verification steps
- Feature regression testing

**Last Updated:** September 22, 2025
**URFMP Version:** 1.0.0

---

## 🔧 Pre-Test Setup

### Environment Verification

- [ ] Development server running at `http://localhost:3001/`
- [ ] API server running at `http://localhost:3000/`
- [ ] All environment variables configured (check `.env` file)
- [ ] Database accessible and seeded with test data
- [ ] No console errors on page load

### Test User Credentials

```
Email: admin@urfmp.com
Password: admin123
API Key: urfmp_dev_9f8e7d6c5b4a3910efabcdef12345678
```

---

## 🏠 **Core System Tests**

### Authentication & Security

- [ ] **Login Page** - Navigate to login, enter credentials
- [ ] **Successful Authentication** - Login redirects to dashboard
- [ ] **Session Persistence** - Refresh page, stay logged in
- [ ] **Logout Functionality** - Logout button works, redirects to login
- [ ] **Invalid Credentials** - Error message displays for wrong password
- [ ] **API Key Authentication** - API requests work with configured key

### Navigation & Layout

- [ ] **Sidebar Navigation** - All menu items clickable and functional
- [ ] **Theme Toggle** - Light/dark mode switch works
- [ ] **Responsive Design** - Layout works on different screen sizes
- [ ] **Page Loading** - All pages load without errors
- [ ] **Breadcrumbs** - Navigation breadcrumbs accurate

---

## 🤖 **Robot Management Tests**

### Robot List Page (`/robots`)

- [ ] **Robot List Display** - All robots show with correct information
- [ ] **Status Indicators** - Online/offline/error status colors correct
- [ ] **Add Robot Button** - Opens modal with form
- [ ] **Robot Filtering** - Filter by status works
- [ ] **Robot Search** - Search by name/model works
- [ ] **Robot Selection** - Click robot opens detail page

### Add Robot Modal

- [ ] **Form Validation** - Required fields show errors when empty
- [ ] **Robot Creation** - New robot appears in list after creation
- [ ] **Modal Close** - Cancel button and X button work
- [ ] **Success Notification** - Toast notification shows on success
- [ ] **Error Handling** - API errors display properly

### Robot Detail Page (`/robots/:id`)

- [ ] **Robot Information** - All details display correctly
- [ ] **Tabbed Interface** - All tabs (Overview, Telemetry, Commands, History) work
- [ ] **Real-time Data** - Telemetry data updates automatically
- [ ] **Edit Robot** - Edit button opens modal with pre-filled data
- [ ] **Delete Robot** - Delete functionality works with confirmation
- [ ] **Command Execution** - Robot commands can be sent

### Telemetry Dashboard

- [ ] **Metric Cards** - Real-time metrics display (temperature, power, position)
- [ ] **Charts** - Line charts show historical data
- [ ] **Time Range Selection** - 1h, 6h, 24h, 7d options work
- [ ] **Live Updates** - Data refreshes without page reload
- [ ] **GPS Position** - GPS coordinates display if available

---

## 🗺️ **GPS & Map Integration Tests**

### Robot Map Page (`/map`)

- [ ] **Map Loading** - Map renders without errors
- [ ] **Robot Markers** - All robots appear as markers on map
- [ ] **Robot Trails** - GPS trails show robot movement history
- [ ] **Robot Selection** - Click marker selects robot and shows info panel
- [ ] **Map Controls** - Zoom in/out, center on robots buttons work
- [ ] **Map Styles** - Street, Satellite, Dark mode toggles work

### Geofencing Integration

- [ ] **Geofence Toggle** - Blue geofence button shows/hides geofences
- [ ] **Waypoint Toggle** - Green waypoint button shows/hides waypoints
- [ ] **Path Toggle** - Purple path button shows/hides paths
- [ ] **Geofence Shapes** - Circles, polygons, rectangles render correctly
- [ ] **Waypoint Markers** - Color-coded waypoints (pickup=green, dropoff=red, etc.)
- [ ] **Path Lines** - Path polylines connect waypoints correctly
- [ ] **Interactive Popups** - Click geofences/waypoints shows detail popup

### Fleet Status Panel

- [ ] **Panel Toggle** - Collapsible fleet panel works
- [ ] **Robot List** - All robots listed with status
- [ ] **Robot Selection** - Click robot in panel selects on map
- [ ] **Status Colors** - Online=green, error=red, idle=yellow, etc.
- [ ] **Auto-center** - Map centers on robots when loaded

---

## 🛡️ **Geofencing System Tests**

### Geofencing Dashboard (`/geofencing`)

- [ ] **5-Tab Interface** - Overview, Waypoints, Geofences, Paths, Events tabs work
- [ ] **Statistics Cards** - Count cards show correct numbers
- [ ] **Recent Events** - Event list displays recent geofencing events

### Waypoints Management

- [ ] **Waypoint List** - All waypoints display in table
- [ ] **Add Waypoint** - "Add Waypoint" button opens modal
- [ ] **Edit Waypoint** - Edit button opens modal with existing data
- [ ] **Delete Waypoint** - Delete button works with confirmation
- [ ] **Waypoint Types** - All types available (pickup, dropoff, charging, etc.)
- [ ] **Action Configuration** - Waypoint actions can be added/edited
- [ ] **Coordinate Input** - Latitude/longitude validation works
- [ ] **Radius Setting** - Radius input accepts valid numbers

### Geofences Management

- [ ] **Geofence List** - All geofences display in table
- [ ] **Add Geofence** - "Add Geofence" button opens modal
- [ ] **Edit Geofence** - Edit button opens modal with existing data
- [ ] **Delete Geofence** - Delete button works with confirmation
- [ ] **Shape Types** - Circle, polygon, rectangle options work
- [ ] **Rule Configuration** - Geofence rules can be added (enter, exit, dwell, speed)
- [ ] **Action Configuration** - Rule actions can be configured
- [ ] **Visual Customization** - Color, stroke width, opacity settings work

### Paths Management

- [ ] **Path List** - All paths display in table
- [ ] **Add Path** - "Add Path" button opens modal
- [ ] **Edit Path** - Edit button opens modal with existing data
- [ ] **Delete Path** - Delete button works with confirmation
- [ ] **Waypoint Sequencing** - Waypoints can be added to path in order
- [ ] **Path Optimization** - "Optimize" button reorders waypoints
- [ ] **Robot Assignment** - Paths can be assigned to robots
- [ ] **Status Management** - Path status can be changed (active, paused, completed)

### Event Monitoring

- [ ] **Event List** - Recent geofencing events display
- [ ] **Event Types** - All event types show (violations, entries, exits)
- [ ] **Event Acknowledgment** - Events can be acknowledged
- [ ] **Event Filtering** - Filter by type, severity, robot works
- [ ] **Real-time Updates** - New events appear automatically

---

## 📊 **Analytics & Reporting Tests**

### Analytics Dashboard (`/analytics`)

- [ ] **Key Metrics** - Fleet overview cards display correctly
- [ ] **Date Range Picker** - Date selection works (7d, 30d, 90d, 1y, custom)
- [ ] **Advanced Filters** - Robot status, efficiency, power, type filters work
- [ ] **Charts & Graphs** - Performance charts render and update
- [ ] **Data Refresh** - Refresh button updates all data
- [ ] **Responsive Layout** - Dashboard adapts to screen size

### Report Generation

- [ ] **Report Templates** - All report types available (Fleet, Performance, Maintenance, Power)
- [ ] **Custom Reports** - Custom report builder works
- [ ] **Export Formats** - CSV, JSON, PDF export options work
- [ ] **Date Range Export** - Exports respect selected date ranges
- [ ] **Filter Export** - Exports apply active filters
- [ ] **Download Success** - Files download and open correctly

---

## 🔧 **Predictive Maintenance Tests**

### Maintenance Dashboard (`/maintenance`)

- [ ] **3-Tab Interface** - Predictive Analytics, Scheduled Tasks, History tabs work
- [ ] **AI Insights** - Predictive insights display with health scores
- [ ] **Component Health** - Health scores show for robot components
- [ ] **Failure Predictions** - Predicted failure dates display
- [ ] **Cost Optimization** - Cost savings recommendations show
- [ ] **Alert Generation** - Maintenance alerts appear for critical issues

### Scheduled Maintenance

- [ ] **Task List** - Scheduled maintenance tasks display
- [ ] **Add Task** - "Add Task" button opens creation modal
- [ ] **Edit Task** - Edit functionality works
- [ ] **Task Completion** - Tasks can be marked complete
- [ ] **Recurring Tasks** - Recurring maintenance can be scheduled
- [ ] **Notifications** - Due date notifications work

### Maintenance History

- [ ] **History List** - Completed maintenance displays
- [ ] **Performance Trends** - Historical performance charts work
- [ ] **Cost Tracking** - Maintenance costs tracked over time
- [ ] **Export History** - Maintenance history can be exported

---

## ⚡ **Real-time Features Tests**

### WebSocket Connectivity

- [ ] **Connection Status** - Connection indicator shows connected
- [ ] **Live Updates** - Data updates without page refresh
- [ ] **Reconnection** - Auto-reconnects after network interruption
- [ ] **Error Handling** - Connection errors handled gracefully

### Real-time Alerts

- [ ] **Alert Notifications** - Real-time alerts appear as toasts
- [ ] **Alert Panel** - Alert panel shows recent alerts
- [ ] **Alert Acknowledgment** - Alerts can be acknowledged
- [ ] **Alert Filtering** - Filter alerts by severity, type
- [ ] **Sound Notifications** - Critical alerts play sounds (if enabled)

### Live Telemetry

- [ ] **Telemetry Updates** - Robot metrics update in real-time
- [ ] **GPS Tracking** - Robot positions update on map
- [ ] **Status Changes** - Robot status changes reflect immediately
- [ ] **Chart Updates** - Charts update with new data points

---

## ⚙️ **Settings & Configuration Tests**

### Settings Page (`/settings`)

- [ ] **Profile Settings** - User profile can be updated
- [ ] **Notification Settings** - Notification preferences can be changed
- [ ] **Theme Settings** - Theme preferences save correctly
- [ ] **API Key Management** - API keys can be viewed/regenerated
- [ ] **Data Retention** - Data retention settings configurable
- [ ] **Backup Settings** - Backup configuration options work

### User Management

- [ ] **User List** - All users display in table
- [ ] **Invite User** - User invitation system works
- [ ] **Edit User** - User roles and permissions can be modified
- [ ] **Deactivate User** - Users can be deactivated
- [ ] **Role Management** - Different user roles work correctly

---

## 🔍 **Error Handling & Edge Cases**

### Network & API Errors

- [ ] **API Timeouts** - Timeout errors handled gracefully
- [ ] **Network Disconnection** - Offline state handled properly
- [ ] **Invalid Responses** - Malformed API responses handled
- [ ] **Rate Limiting** - Rate limit errors display user-friendly messages
- [ ] **Server Errors** - 500 errors show appropriate messages

### Data Validation

- [ ] **Form Validation** - All forms validate required fields
- [ ] **Invalid GPS** - Invalid coordinates show validation errors
- [ ] **Large Numbers** - Large numeric inputs handled correctly
- [ ] **Special Characters** - Special characters in names/descriptions work
- [ ] **Unicode Support** - Unicode characters display correctly

### Edge Cases

- [ ] **Empty States** - Empty lists show appropriate messages
- [ ] **Loading States** - Loading indicators show during operations
- [ ] **Long Text** - Long names/descriptions don't break layout
- [ ] **Many Items** - Large lists (100+ items) perform well
- [ ] **Concurrent Users** - Multiple users can work simultaneously

---

## 📱 **Mobile & Accessibility Tests**

### Mobile Responsiveness

- [ ] **Mobile Layout** - All pages work on mobile screens
- [ ] **Touch Interactions** - Buttons and links work with touch
- [ ] **Mobile Navigation** - Navigation menu works on mobile
- [ ] **Map Controls** - Map zoom/pan works on touch devices
- [ ] **Form Inputs** - Forms usable on mobile keyboards

### Accessibility

- [ ] **Keyboard Navigation** - All functionality accessible via keyboard
- [ ] **Screen Reader** - Screen reader compatibility
- [ ] **Color Contrast** - Sufficient contrast in light/dark modes
- [ ] **Focus Indicators** - Clear focus indicators on interactive elements
- [ ] **Alt Text** - Images have appropriate alt text

---

## 🚀 **Performance Tests**

### Load Performance

- [ ] **Page Load Speed** - Pages load in under 3 seconds
- [ ] **Image Optimization** - Images load efficiently
- [ ] **Bundle Size** - JavaScript bundles are optimized
- [ ] **Caching** - Static assets cache properly
- [ ] **Lazy Loading** - Heavy components load on demand

### Runtime Performance

- [ ] **Smooth Animations** - Transitions and animations are smooth
- [ ] **Memory Usage** - No memory leaks during extended use
- [ ] **CPU Usage** - Application doesn't consume excessive CPU
- [ ] **Map Performance** - Map renders smoothly with many markers
- [ ] **Real-time Updates** - Frequent updates don't degrade performance

---

## ✅ **CI/CD Integration Checklist**

### Automated Test Integration

- [ ] **Unit Tests Pass** - All unit tests pass (`npm test`)
- [ ] **Type Checking** - TypeScript compilation succeeds (`npm run typecheck`)
- [ ] **Linting** - Code style checks pass (`npm run lint`)
- [ ] **Build Success** - Production build completes (`npm run build`)

### Deployment Verification

- [ ] **Environment Variables** - All required env vars set in CI/CD
- [ ] **Database Migrations** - Migrations run successfully
- [ ] **Health Checks** - Health endpoints return 200 status
- [ ] **Smoke Tests** - Critical user flows work post-deployment

### Rollback Plan

- [ ] **Rollback Procedure** - Documented rollback steps
- [ ] **Database Rollback** - Database migration rollback tested
- [ ] **Feature Flags** - Critical features can be disabled via flags
- [ ] **Monitoring Alerts** - Error rate and performance monitoring active

---

## 📋 **Test Execution Log**

**Test Date:** **\*\***\_\_\_**\*\***
**Tester:** **\*\***\_\_\_**\*\***
**Environment:** **\*\***\_\_\_**\*\***
**URFMP Version:** **\*\***\_\_\_**\*\***

### Summary

- **Total Tests:** **\_** / 200+
- **Passed:** **\_**
- **Failed:** **\_**
- **Skipped:** **\_**

### Critical Issues Found

1. ***
2. ***
3. ***

### Sign-off

- [ ] **QA Lead Approval:** **\*\***\_\_\_**\*\***
- [ ] **Product Owner Approval:** **\*\***\_\_\_**\*\***
- [ ] **Ready for Deployment:** **\*\***\_\_\_**\*\***

---

**Note:** This checklist should be updated as new features are added to URFMP. Consider this a living document that grows with the system.
