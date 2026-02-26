// ERROR BOUNDARY FIX
// This file is auto-generated to help prevent cascading errors

/**

* THE FIRST DOMINO: Module Import Errors
*
* ❌ PROBLEM:
* * @/lib/supabase.ts threw at module load time
* * API routes imported it
* * Threw BEFORE Next.js could handle it
* * Browser got raw JS instead of proper error page
* * Result: "Cannot use import statement outside a module"
*
* ✅ SOLUTION: Lazy-load the Supabase client
* * Client only initializes when first used
* * Failures are caught by error boundaries
* * Proper error pages rendered
* * Cascade stops at the first error, doesn't multiply
*
* 🏗 THE THREE SEALED CHAMBERS:
*
* 1. BROWSER (Client)
* * Import: @/lib/supabase.ts or @/lib/supabase-client.ts
* * These are NEXT_PUBLIC_* vars, safe to expose
* * Renders React errors properly
*
* 1. NEXT.JS SERVER (API Routes, RSC, Middleware)
* * Import: createRouteHandlerClient({ cookies })
* * Or: createServerClient()
* * NEVER import @/lib/supabase directly
* * Server secrets stay server-side
*
* 1. EXTERNAL SERVICES (Firebase, OpenAI, etc)
* * Call via API routes only
* * Never expose SDK to client
*
* 🚨 RULE: Never share imports across chambers
*
*
* WHY LAZY LOADING WORKS:
*
* Old (BROKEN):

```ts
// supabase.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL  // Throws NOW

// api/route.ts
import { supabase } from '@/lib/supabase'  // ERROR here

// Next.js can't catch it, browser gets raw error
```

* New (FIXED):

```ts
// supabase.ts
export const supabase = new Proxy({}, {
  get: () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL  // Throws LATER
    // ...
  },
})

// api/route.ts
import { supabase } from '@/lib/supabase'  // OK
const result = await supabase.from('...').select()  // ERROR here (caught by middleware)
```

* The second one allows Next.js to catch and handle the error properly.
*
*
* VERIFICATION CHECKLIST:
*
* ✅ @/lib/supabase.ts is lazy (Proxy-based)
* ✅ Env var errors only throw when used
* ✅ API routes use createRouteHandlerClient
* ✅ No API route imports @/lib/supabase for sensitive operations
* ✅ Client components can use @/lib/supabase (NEXT_PUBLIC_ only)
* ✅ Error pages render with proper HTTP status codes
*

 */

export const BOUNDARY_RULES = {
  CLIENT_TO_SERVER: 'HTTP only (fetch, axios, etc)',
  SERVER_TO_CLIENT: 'HTTP only (NextResponse)',
  SHARED_IMPORTS: 'NEVER - use types only via interfaces',
  ENV_VARS: {
    client: 'NEXT_PUBLIC_* only',
    server: 'Any env var, keep secret',
    shared: 'NEVER'
  }
}

/**

* Common mistakes and how to fix them:
*
* 1. Server lib imported in client component
* ❌ Client: import { adminSdk } from '@/lib/admin'
* ✅ Client: fetch('/api/admin-action', { ... })
*
* 1. Client component imported in server route
* ❌ API: import Component from '@/components/MyComponent'
* ✅ API: Use services, not React
*
* 1. Process.env used in client component
* ❌ Client: const key = process.env.SECRET_KEY
* ✅ Client: const key = process.env.NEXT_PUBLIC_KEY
* ✅ Client: fetch('/api/get-secret').then(r => r.json())
*
* 1. env var undefined at module load
* ❌ const config = { key: process.env.API_KEY! } // Throws if undefined
* ✅ Lazy: getConfig() { return { key: process.env.API_KEY } }
 */
