type AuthErrorLike = {
  name?: string | null
  message?: string | null
} | null | undefined

/**
 * Supabase reports an absent auth cookie as AuthSessionMissingError.
 * That is a normal unauthenticated state, not an application failure.
 */
export function isMissingAuthSessionError(error: AuthErrorLike): boolean {
  return (
    error?.name === 'AuthSessionMissingError' ||
    /auth session missing/i.test(error?.message ?? '')
  )
}
