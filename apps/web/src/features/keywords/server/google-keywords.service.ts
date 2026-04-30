import type { SupabaseClient } from '@supabase/supabase-js'

const GOOGLE_SUGGEST_ENDPOINT = 'https://suggestqueries.google.com/complete/search'

export interface GoogleKeywordLookupInput {
  userId: string
  query: string
  locale?: string
  projectName?: string
}

function uniqueKeywords(values: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = value.trim()
    if (!normalized) continue
    const lower = normalized.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(normalized)
  }

  return result
}

function normalizeLocale(locale: string | undefined): string {
  if (!locale) return 'en-US'
  return locale.trim() || 'en-US'
}

async function fetchGoogleSuggestions(query: string, locale: string): Promise<string[]> {
  const url = new URL(GOOGLE_SUGGEST_ENDPOINT)
  url.searchParams.set('client', 'firefox')
  url.searchParams.set('q', query)

  const [lang, region] = locale.split('-')
  if (lang) url.searchParams.set('hl', lang)
  if (region) url.searchParams.set('gl', region)

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json,text/plain,*/*',
      'User-Agent': 'Mozilla/5.0 (compatible; LaunchpadContentBot/1.0)',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Google keyword lookup failed (${response.status})`)
  }

  const payload: unknown = await response.json()
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    return [query]
  }

  const suggestions = payload[1].filter((item): item is string => typeof item === 'string')
  return uniqueKeywords([query, ...suggestions])
}

export async function lookupAndPersistGoogleKeywords(
  supabase: SupabaseClient,
  input: GoogleKeywordLookupInput
): Promise<{
  project: { id: string; name: string; locale: string }
  keywords: Array<{ keyword: string; source: string }>
}> {
  const query = input.query.trim()
  if (!query) {
    throw new Error('query is required')
  }

  const locale = normalizeLocale(input.locale)
  const projectName = (input.projectName || `${query} keyword set`).trim()

  const suggestions = await fetchGoogleSuggestions(query, locale)

  const now = new Date().toISOString()
  const { data: project, error: projectError } = await supabase
    .from('google_keyword_projects')
    .insert({
      user_id: input.userId,
      name: projectName,
      seed_query: query,
      locale,
      created_at: now,
      updated_at: now,
    })
    .select('id,name,locale')
    .single()

  if (projectError || !project) {
    throw new Error(projectError?.message || 'Unable to create keyword project')
  }

  const keywordRows = suggestions.map((keyword) => ({
    project_id: project.id,
    user_id: input.userId,
    keyword,
    source: 'google_autocomplete',
    metadata: { seedQuery: query, locale },
  }))

  const { error: keywordsInsertError } = await supabase
    .from('google_keywords')
    .insert(keywordRows)

  if (keywordsInsertError) {
    throw new Error(keywordsInsertError.message)
  }

  return {
    project,
    keywords: suggestions.map((keyword) => ({ keyword, source: 'google_autocomplete' })),
  }
}

export async function listRecentKeywordProjects(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('google_keyword_projects')
    .select('id,name,seed_query,locale,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}
