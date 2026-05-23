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

Optional (publish retry controls):

- `PUBLISH_MAX_ATTEMPTS` (default `3`)
- `PUBLISH_RETRY_BASE_SECONDS` (default `300`)
- `PUBLISH_RETRY_MAX_SECONDS` (default `21600`)

## Setup

1. Run SQL migration for content automation tables.
2. Configure one CMS integration via `/api/integrations/cms` (webhook first).
3. Verify keyword lookup via `/api/integrations/google/keywords`.
4. Generate content via `/api/content/generate`.
5. Create schedule via `/api/publish/schedule`.
6. Trigger publish runner via `/api/publish/run`.

## Vercel Cron Trigger

Use cron to call `/api/publish/run` with secret header.

## Publish Retry and Dead-Letter Behavior

- `/api/publish/run` processes due `content_schedule` rows with `status='queued'`.
- On publish failure:
  - A `publish_jobs` row is inserted with incremented `attempt`.
  - If attempts remain, the schedule is re-queued with a future `run_at` using exponential backoff.
  - If max attempts is reached, the schedule is marked `failed` (terminal dead-letter state).
- Terminal failures are recorded with `response_payload.terminal=true` in `publish_jobs`.

Recommended production defaults:

- `PUBLISH_MAX_ATTEMPTS=3`
- `PUBLISH_RETRY_BASE_SECONDS=300` (5 minutes)
- `PUBLISH_RETRY_MAX_SECONDS=21600` (6 hours)

Backoff progression with defaults:

- Attempt 1 failure -> retry in 5m
- Attempt 2 failure -> retry in 10m
- Attempt 3 failure -> dead-letter (`content_schedule.status='failed'`)

## Troubleshooting

- `401` on `/api/publish/run`: verify `PUBLISH_CRON_SECRET`.
- `503` on publishing: verify `SUPABASE_SERVICE_ROLE_KEY` and at least one active CMS integration.
- Empty keyword results: broaden query; Google suggestion endpoint can return fewer niche terms.
- AI fallback output: indicates missing or failing OpenAI call.
- Repeated publish failures: inspect `publish_jobs` by `schedule_id` for `attempt`, `error_message`, and `response_payload`.
