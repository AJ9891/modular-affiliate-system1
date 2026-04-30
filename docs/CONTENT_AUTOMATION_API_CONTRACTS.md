# Content Automation API Contracts

## POST `/api/content/generate`

Generate article and funnel payloads from URL or keyword.

### Request

```json
{
  "sourceUrl": "https://example.com/offer",
  "keyword": "best crm for startups",
  "tone": "professional",
  "audienceHint": "B2B founders",
  "nicheHint": "saas",
  "persist": true
}
```

### Response

```json
{
  "success": true,
  "content": {
    "title": "...",
    "slug": "...",
    "article": {
      "metaTitle": "...",
      "metaDescription": "...",
      "markdown": "..."
    },
    "funnel": {
      "headline": "...",
      "subheadline": "...",
      "cta": "...",
      "blocks": []
    },
    "emails": []
  },
  "saved": {
    "funnelId": "uuid|null"
  }
}
```

## POST `/api/integrations/google/keywords`

Lookup related keywords via Google suggestion integration.

### Request

```json
{
  "query": "affiliate marketing tools",
  "locale": "en-US",
  "projectName": "April content plan"
}
```

### Response

```json
{
  "success": true,
  "project": {
    "id": "uuid",
    "name": "April content plan"
  },
  "keywords": [
    {
      "keyword": "affiliate marketing tools for beginners",
      "source": "google_autocomplete"
    }
  ]
}
```

## GET/POST `/api/integrations/cms`

Manage publish integration settings.

### POST Request

```json
{
  "provider": "webhook",
  "targetUrl": "https://example.com/hooks/publish",
  "authType": "bearer",
  "authValue": "token-value",
  "isActive": true
}
```

## GET/POST `/api/publish/schedule`

Create and list scheduled publish runs.

### POST Request

```json
{
  "title": "CRM comparison article",
  "runAt": "2026-04-30T20:00:00Z",
  "content": {
    "type": "article_and_funnel",
    "payload": {}
  }
}
```

## GET/POST `/api/publish/run`

Execute due scheduled publishes.

### Auth

Requires `Authorization: Bearer <PUBLISH_CRON_SECRET>` or `x-publish-secret`.

### POST Request

```json
{
  "limit": 25
}
```

### Response

```json
{
  "success": true,
  "processed": 12,
  "published": 10,
  "failed": 2
}
```
