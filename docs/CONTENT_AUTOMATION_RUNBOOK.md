# Content Automation Runbook

## Environment Variables

Required for runtime:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY` (optional but recommended; fallback generation exists)
- `PUBLISH_CRON_SECRET`

Optional (future Google Ads integration):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_ADS_DEVELOPER_TOKEN`

## Setup

1. Run SQL migration for content automation tables.
2. Configure one CMS integration via `/api/integrations/cms` (webhook first).
3. Verify keyword lookup via `/api/integrations/google/keywords`.
4. Generate content via `/api/content/generate`.
5. Create schedule via `/api/publish/schedule`.
6. Trigger publish runner via `/api/publish/run`.

## Vercel Cron Trigger

Use cron to call `/api/publish/run` with secret header.

## Troubleshooting

- `401` on `/api/publish/run`: verify `PUBLISH_CRON_SECRET`.
- `503` on publishing: verify at least one active CMS integration.
- Empty keyword results: broaden query; Google suggestion endpoint can return fewer niche terms.
- AI fallback output: indicates missing or failing OpenAI call.
