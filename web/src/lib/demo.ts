/**
 * Demo mode
 * --------------------------------------------------------------------------
 * Powers the no-login, no-backend "live demo" of the URFMP dashboard.
 *
 * When demo mode is active the app authenticates a synthetic user, renders
 * everything from the in-memory fixtures below, and never touches the Express
 * API, the WebSocket gateway, or any auth endpoint. This is what gets deployed
 * to Vercel as a static site with no environment variables.
 *
 * Demo mode turns on when ANY of the following are true:
 *   - the build was made with VITE_DEMO_MODE=true (the Vercel default)
 *   - the URL contains ?demo (or ?demo=1) — handy for sharing a link
 *   - the visitor previously opted into the demo (persisted in localStorage)
 */

const DEMO_FLAG_KEY = 'urfmp_demo_mode'

/**
 * Single source of truth for whether the app is running in demo mode.
 * Safe to call during render and outside React.
 */
export function isDemoMode(): boolean {
  // 1. Build-time flag (Vercel deploy default).
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    return true
  }

  if (typeof window !== 'undefined') {
    // 2. ?demo query param. Persist so it survives client-side navigation.
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.has('demo')) {
        const value = params.get('demo')
        if (value === null || value === '' || value === '1' || value === 'true') {
          try {
            localStorage.setItem(DEMO_FLAG_KEY, 'true')
          } catch {
            /* ignore storage errors (private mode, etc.) */
          }
          return true
        }
      }
    } catch {
      /* ignore URL parse errors */
    }

    // 3. Previously opted in.
    try {
      if (localStorage.getItem(DEMO_FLAG_KEY) === 'true') {
        return true
      }
    } catch {
      /* ignore */
    }
  }

  return false
}

/** Explicitly opt into demo mode (used by the "View live demo" button). */
export function enableDemoMode(): void {
  try {
    localStorage.setItem(DEMO_FLAG_KEY, 'true')
  } catch {
    /* ignore */
  }
}

/** Synthetic identity used so ProtectedRoute lets demo visitors through. */
export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@urfmp.com',
  firstName: 'Demo',
  lastName: 'Operator',
  role: 'admin',
  permissions: ['robot:read', 'robot:write', 'telemetry:read', 'maintenance:read'],
}

export const DEMO_ORGANIZATION = {
  id: 'demo-org',
  name: 'Aurora Robotics (Demo)',
  slug: 'aurora-demo',
  plan: 'enterprise',
}

/**
 * A decode-able (but unsigned) JWT so any code that calls atob() on the
 * payload keeps working. This token is never sent anywhere.
 */
function buildDemoJwt(): string {
  const header = { alg: 'none', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: DEMO_USER.id,
    org: DEMO_ORGANIZATION.id,
    email: DEMO_USER.email,
    role: DEMO_USER.role,
    permissions: DEMO_USER.permissions,
    scope: DEMO_USER.permissions,
    iat: now,
    exp: now + 60 * 60 * 24 * 365, // far future so it never "expires"
    aud: 'urfmp-demo',
    iss: 'urfmp-demo',
  }
  const b64 = (obj: unknown) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64(header)}.${b64(payload)}.demo`
}

export const DEMO_TOKENS = {
  accessToken: buildDemoJwt(),
  refreshToken: 'demo-refresh-token',
  tokenType: 'Bearer' as const,
  expiresIn: 60 * 60 * 24 * 365,
  scope: DEMO_USER.permissions,
}
