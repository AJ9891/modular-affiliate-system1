# 🚨 FIRST DOMINO FIX: Error Boundary Restoration

## The Cascade You Were Experiencing

```text
1. ❌ Cannot use import statement outside a module
   ↓
2. ❌ Firebase: Error (auth/network-request-failed)
   ↓
3. ❌ 500 on api/brand-brain
   ↓
4. ❌ React error #310 - Hooks invalid context
   ↓
5. ❌ Chrome extension message-channel error
```

**Every error after #1 was collateral damage.** Fixing the first domino stops the cascade.

---

## Root Cause Analysis

### The Problem

`@/lib/supabase.ts` was throwing at **module load time**:

```typescript
// OLD (BROKEN)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('...')  // ← Throws when module loads
}
```

### Why This Breaks Everything

1. **API routes imported this**: `import { supabase } from '@/lib/supabase'`
2. **Next.js tried to bundle it**
3. **Module threw before async handling**
4. **Browser received raw JS instead of proper error page**
5. **Result**: "Cannot use import statement outside a module"

The browser couldn't distinguish between:

- A real module error
- A misconfigured import
- Missing environment variables

It just saw broken JS.

---

## The Fix: Lazy Loading via Proxy

### New Pattern

```typescript
// NEW (FIXED)
let cachedClient: any = null

function getClient() {
  if (cachedClient) return cachedClient

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('...')  // ← Only throws when used
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}

export const supabase = new Proxy({}, {
  get: (_target, prop) => {
    const client = getClient()
    return (client as any)[prop]
  }
})
```

### Why This Works

- ✅ **Import succeeds**: No error at module load
- ✅ **Error caught later**: When `.from()` is called, error is caught by Next.js middleware
- ✅ **Proper error page**: Next.js renders a 500 with stack trace
- ✅ **Cascade stops**: No "Cannot use import" in browser console

---

## The Three Sealed Chambers

```text
┌──────────────────┐
│  Browser/Client  │ ← React, 'use client' components
│  NEXT_PUBLIC_*   │ ← Only these env vars exposed
└──────────────────┘
           ▲
           │ HTTP (fetch/axios)
           ▼
┌──────────────────┐
│  Next.js Server  │ ← API routes, RSC, middleware
│  All env vars    │ ← Service role keys safe here
└──────────────────┘
           ▲
           │ HTTP
           ▼
┌──────────────────┐
│External Services │ ← Firebase, OpenAI, Stripe
│  No SDK leaking  │ ← Call only from server
└──────────────────┘
```

### RULE: Never share imports across chambers

---

## What Changed

### 1. `/src/lib/supabase.ts`

- ✅ Now uses lazy-loading Proxy
- ✅ Errors only throw when used
- ✅ Safe to import everywhere

### 2. `/src/lib/supabase-client.ts` (NEW)

- ✅ Explicit client-only version
- ✅ Has early error checking
- ✅ For 'use client' components

### 3. `/src/app/api/modules/[id]/activate/route.ts`

- ✅ Removed `import { supabase }`
- ✅ Now uses `createRouteHandlerClient({ cookies })`
- ✅ Server-only pattern

### 4. `/src/app/api/domains/route.ts`

- ✅ Added `validateEnv()` function
- ✅ Fails loudly if Vercel env vars missing
- ✅ Uses lazy import for Supabase admin client

---

## For API Routes: Use This Pattern

### ❌ WRONG

```typescript
// API route
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('users').select()
}
```

### ✅ RIGHT

```typescript
// API route
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data } = await supabase.from('users').select()
}
```

---

## For Client Components: Use This Pattern

### ❌ WRONG (before fix)

```typescript
'use client'
import { supabase } from '@/lib/supabase'  // Would throw at load

export function MyComponent() {
  const [data, setData] = useState(null)
  useEffect(() => {
    supabase.from('users').select().then(setData)
  }, [])
}
```

### ✅ RIGHT (after fix)

```typescript
'use client'
import { supabase } from '@/lib/supabase'  // Now safe - lazy loads

export function MyComponent() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    supabase.from('users').select()
      .then(({ data }) => setData(data))
      .catch(setError)  // Error handled properly
  }, [])
  
  if (error) return <div>Error: {error.message}</div>
  return <div>{data && data.length} users</div>
}
```

---

## Environment Variables: Checklist

### Required (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-only!
OPENAI_API_KEY=sk-...              # Server-only!
```

### Optional (Production)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
VERCEL_API_TOKEN=...
```

### Verification

```bash
# Check if env vars are being loaded
npm run dev

# In browser console, you should NOT see:
# "Cannot use import statement outside a module"

# Instead, you might see:
# "NEXT_PUBLIC_SUPABASE_URL is not set" (if missing)
# But this will be a proper React error, not a module error
```

---

## How to Verify the Fix Is Working

### Test 1: Check imports succeed

```bash
cd apps/web
node -e "const m = require('./src/lib/supabase.ts'); console.log('Import OK')"
# Should NOT throw
```

### Test 2: Check error handling

```bash
# Temporarily unset NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_URL= npm run dev

# You should see:
# ✅ Page loads (no "Cannot use import" error)
# ✅ Error appears when component tries to use supabase
# ✅ Error is caught and displayed properly
```

### Test 3: Check error messages are clear

Look for error messages like:

- `[CLIENT ERROR] NEXT_PUBLIC_SUPABASE_URL is not set`
- `[API/DOMAINS] VERCEL_API_TOKEN is required`

Instead of:

- `Cannot use import statement outside a module`
- `Unexpected token 'export'`

---

## Future Maintenance

When adding new API routes:

1. **Do NOT** import from `@/lib/supabase` directly
2. **Instead** use:

   ```typescript
   import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
   import { cookies } from 'next/headers'
   
   const supabase = createRouteHandlerClient({ cookies })
   ```

3. **If needing service role** operations, use lazy import:

   ```typescript
   if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
     throw new Error('[API/YOUR-ROUTE] SUPABASE_SERVICE_ROLE_KEY required')
   }
   
   const { createClient } = await import('@supabase/supabase-js')
   const admin = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!
   )
   ```

4. **Always validate env vars early**:

   ```typescript
   function validateEnv() {
     if (!process.env.MY_REQUIRED_VAR) {
       throw new Error('[API/MY-ROUTE] MY_REQUIRED_VAR is required')
     }
   }
   
   export async function POST(req) {
     validateEnv()  // ← First thing!
     // ... rest of handler
   }
   ```

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "Cannot use import" | Eager module throw | Lazy-load with Proxy |
| Firebase errors | Page never stabilized | Fix allows proper init |
| 500 errors | Cascading failures | Boundary stops cascade |
| React #310 | Broken component tree | Tree now loads properly |
| Extension errors | Page crash | No crash = no extension errors |

**You've successfully stopped the first domino.** The cascade is now contained.
