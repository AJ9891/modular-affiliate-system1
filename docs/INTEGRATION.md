# Modular Affiliate System - Integration Guide

## Overview

This system combines:

1. Visual and code-based funnel building.
2. Supabase-backed data, auth, and analytics.
3. Built-in email automation (autoresponder) with optional SES transport.
4. Stripe billing and subscription workflows.
5. AI-assisted content generation.

## Key Integration Areas

### Funnel Builder

- Visual drag-and-drop editor at `/visual-builder`.
- Code-first builder at `/builder`.
- Email capture blocks feed directly into lead capture and subscriber automation.

### Email Automation

- API routes under `/api/email/*`:
  - `POST /api/email/send`
  - `GET/POST /api/email/templates`
  - `POST/PUT /api/email/automation`
  - `POST/GET /api/email/reports`
  - `GET/POST /api/email/autoresponder/run`
- Provider abstraction in `apps/web/src/lib/email/service.ts`:
  - `autoresponder` (default)
  - `ses`

### Lead Capture

- `POST /api/leads/capture` stores leads and updates subscribers.
- Active signup automations are triggered automatically.
- Delayed automation emails are queued in `email_autoresponder_jobs`.

### Analytics

- Funnel and event analytics are persisted in Supabase.
- Weekly report endpoint builds and sends email summaries.

### Payments

- Stripe checkout, portal, and webhook flow under `/api/stripe/*`.

## Environment Setup

Use `apps/web/.env.example` as source of truth.

Required baseline:

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

OPENAI_API_KEY=your_openai_key

STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret

EMAIL_PROVIDER=autoresponder
EMAIL_DEFAULT_FROM=user@launchpad4success.pro
EMAIL_DEFAULT_FROM_NAME=Launchpad4Success
AUTORESPONDER_CRON_SECRET=replace_with_strong_secret
CRON_SECRET=replace_with_same_strong_secret

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
SES_CONFIGURATION_SET=launchpad-prod
```

## Database Requirements

Apply Supabase schema/migrations including:

- `email_automations`
- `email_subscribers`
- `email_autoresponder_jobs`
- `email_campaigns`
- `leads`

Primary migration for autoresponder objects:

- `infra/migrations/20260423_add_autoresponder_tables.sql`

## Autoresponder Queue Operations

- Queue runner endpoint: `/api/email/autoresponder/run`
- Auth:
  - `Authorization: Bearer <AUTORESPONDER_CRON_SECRET|CRON_SECRET>`
  - or header `x-autoresponder-secret`
- Vercel cron schedule: daily (`0 0 * * *`) for Hobby plan compatibility.

## Core Workflows

### Lead to Automation Flow

1. Visitor submits email via funnel.
2. `POST /api/leads/capture` creates lead record.
3. Subscriber upserted to `email_subscribers`.
4. Active signup automations are loaded.
5. Immediate steps send now; delayed steps queue for cron processing.

### Campaign Flow

1. Create campaign via `POST /api/email/send` with `type=campaign`.
2. Campaign metadata persisted in `email_campaigns`.
3. Recipients are sent immediately or scheduled based on `scheduledAt`.
4. Stats can be retrieved from `GET /api/email/reports?campaignId=...`.

### Weekly Report Flow

1. Invoke `POST /api/email/reports` with `funnelId`, `recipientEmail`, `dateRange`.
2. Endpoint computes click/conversion metrics.
3. HTML report is generated and emailed through active provider.

## Troubleshooting

### Emails Failing

- Check provider selection via `EMAIL_PROVIDER`.
- Confirm SES credentials and verified sender/domain.
- Review API logs for `502` provider/network errors.

### Queue Not Sending

- Verify cron secrets are configured.
- Verify cron is enabled in Vercel config.
- Check `email_autoresponder_jobs` for stuck statuses.

### Automations Not Triggering

- Ensure automation is active.
- Verify trigger type and subscriber insertion.
- Confirm DB policies permit service role operations.

## References

- `README.md`
- `apps/web/.env.example`
- `docs/SENDSHARK.md` (legacy filename, updated content)
- `infra/supabase-schema.sql`
- `infra/migrations/20260423_add_autoresponder_tables.sql`
