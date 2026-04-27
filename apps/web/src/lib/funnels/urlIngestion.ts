const FETCH_TIMEOUT_MS = 10_000
const MAX_HTML_LENGTH = 900_000
const MAX_TEXT_LENGTH = 14_000

const BLOCKED_HOSTNAMES = new Set(['localhost', '0.0.0.0', '127.0.0.1', '::1'])

export interface IngestedUrlData {
  normalizedUrl: string
  host: string
  title: string
  description: string
  siteName: string
  headings: string[]
  contentText: string
  wordCount: number
}

function titleCase(words: string[]): string {
  return words
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
    .trim()
}

function isPrivateIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!match) return false

  const parts = match.slice(1).map((part) => Number(part))
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) return true

  const [a, b] = parts
  if (a === 10) return true
  if (a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true

  return false
}

function normalizeUserUrl(rawUrl: string): URL {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    throw new Error('URL is required')
  }

  let parsed: URL

  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('URL must be valid and include http:// or https://')
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http:// and https:// URLs are supported')
  }

  const hostname = parsed.hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || isPrivateIpv4(hostname)) {
    throw new Error('Private or local URLs are not allowed')
  }

  return parsed
}

function inferTitleFromUrl(parsedUrl: URL): string {
  const safePathname = (() => {
    try {
      return decodeURIComponent(parsedUrl.pathname)
    } catch {
      return parsedUrl.pathname
    }
  })()

  const pathPieces = safePathname
    .split(/[/?#]+/)
    .join(' ')
    .split(/[-_.\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1)
    .slice(0, 6)

  const pathTitle = titleCase(pathPieces)
  if (pathTitle.length > 0) return pathTitle.slice(0, 100)

  const hostLabel = parsedUrl.hostname.replace(/^www\./, '').split('.')[0] || 'Offer'
  return titleCase(hostLabel.split(/[-_.\s]+/).filter(Boolean)).slice(0, 100) || 'Offer'
}

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function stripHtml(rawHtml: string): string {
  return decodeHtmlEntities(
    rawHtml
      .replace(/<(script|style|noscript|template|svg|canvas)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTagContent(html: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = html.match(regex)
  return match?.[1] ? decodeHtmlEntities(match[1]).replace(/\s+/g, ' ').trim() : ''
}

function extractMetaContent(html: string, key: string): string {
  const attributePatterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, 'i'),
  ]

  for (const pattern of attributePatterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeHtmlEntities(match[1]).trim()
  }

  return ''
}

function extractHeadings(html: string, maxCount = 6): string[] {
  const headings: string[] = []
  const regex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi

  let match = regex.exec(html)
  while (match && headings.length < maxCount) {
    const heading = decodeHtmlEntities(match[1]).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (heading.length > 0) {
      headings.push(heading)
    }
    match = regex.exec(html)
  }

  return headings
}

export async function ingestOfferUrl(rawUrl: string): Promise<IngestedUrlData> {
  const parsedUrl = normalizeUserUrl(rawUrl)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(parsedUrl.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'LaunchpadBot/1.0 (+https://launchpad4success.app)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      throw new Error(`Could not fetch URL (${response.status})`)
    }

    const html = (await response.text()).slice(0, MAX_HTML_LENGTH)
    const title = extractTagContent(html, 'title') || extractMetaContent(html, 'og:title')
    const description = extractMetaContent(html, 'description') || extractMetaContent(html, 'og:description')
    const siteName = extractMetaContent(html, 'og:site_name') || parsedUrl.hostname

    const contentText = stripHtml(html).slice(0, MAX_TEXT_LENGTH)
    const headings = extractHeadings(html)

    return {
      normalizedUrl: response.url || parsedUrl.toString(),
      host: parsedUrl.hostname,
      title,
      description,
      siteName,
      headings,
      contentText,
      wordCount: contentText.length === 0 ? 0 : contentText.split(/\s+/).length,
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timed out while fetching URL')
    }

    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function buildFallbackIngestedUrl(rawUrl: string): IngestedUrlData {
  const parsedUrl = normalizeUserUrl(rawUrl)
  const title = inferTitleFromUrl(parsedUrl)
  const description = `Generated from URL metadata because live page fetching was unavailable for ${parsedUrl.hostname}.`
  const contentText = `${title}. ${description}`

  return {
    normalizedUrl: parsedUrl.toString(),
    host: parsedUrl.hostname,
    title,
    description,
    siteName: parsedUrl.hostname,
    headings: [title],
    contentText,
    wordCount: contentText.split(/\s+/).length,
  }
}
