# Dynamic Branding Configuration

This project supports dynamic company branding that can be changed in one place and will update throughout the entire application.

## Quick Start

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your company information:

   ```bash
   # Change these values to your company branding
   VITE_COMPANY_NAME=YourCompany
   VITE_PRODUCT_NAME=YourProduct
   VITE_PRODUCT_FULL_NAME=Your Product Full Name
   VITE_TAGLINE=Your Company Tagline
   VITE_DESCRIPTION=Your product description
   ```

3. Restart your development servers to see the changes.

## Environment Variables

### Frontend (Vite) Variables

- `VITE_COMPANY_NAME` - Short company/product name (e.g., "URFMP")
- `VITE_COMPANY_NAME_SHORT` - Even shorter version for mobile displays
- `VITE_PRODUCT_NAME` - Product name (e.g., "URFMP")
- `VITE_PRODUCT_FULL_NAME` - Full product name (e.g., "Universal Robot Fleet Management Platform")
- `VITE_TAGLINE` - Company tagline (e.g., "The Stripe of Robotics")
- `VITE_DESCRIPTION` - Product description (e.g., "Monitor any robot in 7 lines of code")

### Backend Variables

- `COMPANY_NAME` - Short company/product name
- `PRODUCT_NAME` - Product name
- `PRODUCT_FULL_NAME` - Full product name
- `TAGLINE` - Company tagline
- `DESCRIPTION` - Product description

## What Gets Updated

When you change the environment variables, the following will automatically update:

### Frontend

- Browser tab title
- Meta description for SEO
- Any React component using the `useBrand()` hook

### Backend

- API server name and description
- Mock server responses

### HTML

- Page title in `index.html`
- Meta description in `index.html`

## Usage in React Components

Use the `useBrand()` hook to access brand configuration in your components:

```tsx
import { useBrand } from '@/hooks/useBrand'

function MyComponent() {
  const brand = useBrand()

  return (
    <div>
      <h1>Welcome to {brand.productName}</h1>
      <p>{brand.tagline}</p>
      <p>{brand.description}</p>
    </div>
  )
}
```

## Dynamic Document Title

Use the `useDocumentTitle()` hook to set page-specific titles:

```tsx
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function RobotsPage() {
  useDocumentTitle('Robots') // Sets title to "Robots - YourProduct"

  return <div>...</div>
}
```

## Example Rebranding

To rebrand from "URFMP" to "RoboFleet":

```bash
# .env file
VITE_COMPANY_NAME=RoboFleet
VITE_PRODUCT_NAME=RoboFleet
VITE_PRODUCT_FULL_NAME=RoboFleet Management Platform
VITE_TAGLINE=Your Robot Management Solution
VITE_DESCRIPTION=Comprehensive robot fleet management and monitoring

# Also update backend variables
COMPANY_NAME=RoboFleet
PRODUCT_NAME=RoboFleet
PRODUCT_FULL_NAME=RoboFleet Management Platform
TAGLINE=Your Robot Management Solution
DESCRIPTION=Comprehensive robot fleet management and monitoring
```

This will automatically update:

- Browser tab title to "RoboFleet - RoboFleet Management Platform"
- Meta description to "Your Robot Management Solution - Comprehensive robot fleet management and monitoring"
- API responses to show "RoboFleet API (Mock)"
- All components using the brand configuration

## Files Modified

The branding system includes:

- `packages/types/src/config/brand.ts` - Brand configuration types and defaults
- `web/src/hooks/useBrand.ts` - React hook for accessing brand config
- `web/src/hooks/useDocumentTitle.ts` - Hook for dynamic page titles
- `web/index.html` - HTML template with environment variable placeholders
- `mock-api-server.js` - Updated to use dynamic branding
- `.env.example` - Example environment configuration
