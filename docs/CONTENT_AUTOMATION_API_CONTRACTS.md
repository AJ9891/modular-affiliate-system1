# Content Automation API Contracts

## POST `/api/content/generate`

Generate article and funnel payloads from URL or keyword.

### Generate Request

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

### Generate Response

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

### Keyword Lookup Request

```json
{
  "query": "affiliate marketing tools",
  "locale": "en-US",
  "projectName": "April content plan"
}
```

### Keyword Lookup Response

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

### CMS Integration POST Request

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

### Publish Schedule POST Request

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

### Publish Run Auth

Requires `Authorization: Bearer <PUBLISH_CRON_SECRET>` or `x-publish-secret`.

### Publish Run POST Request

```json
{
  "limit": 25
}
```

### Publish Run Response

```json
{
  "success": true,
  "processed": 12,
  "published": 10,
  "failed": 2,
  "retried": 1,
  "deadLettered": 1
}
```

### Retry Semantics

- `failed`: number of attempts that failed during this runner execution.
- `retried`: failed attempts that were re-queued with a future `run_at`.
- `deadLettered`: failed attempts that hit `PUBLISH_MAX_ATTEMPTS` and were marked terminal (`content_schedule.status='failed'`).
