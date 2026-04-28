import { describe, it } from 'vitest'

// Placeholder for HTTP-level auth/session flows.
// This test file intentionally defines explicit TODOs so CI reports pending
// integration coverage without pretending the flows are verified yet.
describe('auth session integration', () => {
  it.todo('login establishes SSR cookie session and /api/auth/me resolves user')
  it.todo('protected route returns 401 when session is absent')
  it.todo('team endpoints reject unauthorized requests consistently')
})
