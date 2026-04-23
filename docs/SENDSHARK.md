# Email Integration Guide

Note: This file keeps its historical filename for compatibility, but the active implementation is now the built-in autoresponder with optional AWS SES transport.

## Provider Modes

- `EMAIL_PROVIDER=autoresponder` (default):
  - Uses the built-in automation engine.
  - Persists subscribers, automations, campaigns, and queued jobs in Supabase.
  - Uses SES transport under the hood for delivery, with queue fallback.
- `EMAIL_PROVIDER=ses`:
  - Uses direct SES sending with in-memory template/automation stores.

Legacy compatibility:

- `EMAIL_PROVIDER=sendshark` is accepted and mapped to `autoresponder`.

## Required Environment Variables

```env
EMAIL_PROVIDER=autoresponder
EMAIL_DEFAULT_FROM=user@launchpad4success.pro
EMAIL_DEFAULT_FROM_NAME=Launchpad4Success
AUTORESPONDER_CRON_SECRET=replace_with_strong_secret
CRON_SECRET=replace_with_same_strong_secret
```

SES settings (required for SES delivery):

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
SES_CONFIGURATION_SET=launchpad-prod
```

## Queue Runner

- Endpoint: `GET/POST /api/email/autoresponder/run`
- Auth accepted via:
  - `Authorization: Bearer <AUTORESPONDER_CRON_SECRET|CRON_SECRET>`
  - `x-autoresponder-secret: <AUTORESPONDER_CRON_SECRET|CRON_SECRET>`
- Optional limit:
  - Query: `?limit=100`
  - POST body: `{ "limit": 100 }`

Vercel cron configuration is set to run this endpoint every 5 minutes.

## API Endpoints

### Send Email

```http
POST /api/email/send
```

Body:

```json
{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<p>Email content</p>",
  "trackOpens": true,
  "trackClicks": true
}
```

### Create Campaign

```http
POST /api/email/send
```

Body:

```json
{
  "type": "campaign",
  "name": "My Campaign",
  "subject": "Campaign Subject",
  "html": "<p>Campaign content</p>",
  "recipients": [
    { "email": "user1@example.com", "name": "User 1" }
  ]
}
```

### Create or Trigger Automation

```http
POST /api/email/automation
```

Trigger body:

```json
{
  "action": "trigger",
  "automationId": "automation-uuid",
  "recipient": {
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Setup Default Automations

```http
PUT /api/email/automation
```

### Send Weekly Report

```http
POST /api/email/reports
```

Body:

```json
{
  "recipientEmail": "admin@example.com",
  "funnelId": "funnel_123",
  "dateRange": {
    "start": "2026-01-01",
    "end": "2026-01-07"
  }
}
```

## Lead Capture Integration

When a lead is captured via `POST /api/leads/capture`, the system:

1. Saves the lead to the `leads` table.
2. Adds/updates subscriber in `email_subscribers`.
3. Triggers active signup automations.
4. Queues delayed autoresponder emails in `email_autoresponder_jobs`.

## Troubleshooting

### Queue Not Processing

- Verify `AUTORESPONDER_CRON_SECRET` and/or `CRON_SECRET` are set.
- Confirm Vercel cron is active for `/api/email/autoresponder/run`.
- Check `email_autoresponder_jobs` rows are in `queued` state with past `scheduled_for`.

### Email Not Sending

- Verify `EMAIL_PROVIDER` and provider credentials.
- For SES: confirm sender identity/domain is verified in AWS SES.
- Check API logs for upstream provider/network errors (returned as `502`).

### Automation Not Triggering

- Verify automation is `active=true`.
- Confirm trigger type matches (`signup`, `abandoned_cart`, etc.).
- Ensure lead capture is occurring with valid subscriber email.
