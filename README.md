# Launchpad4 Success

Launchpad4 Success is an AI-assisted affiliate marketing platform for building funnels, preparing lead magnets and follow-up content, capturing leads, and measuring campaign performance.

This Next.js monorepo contains the capabilities below. Production readiness depends on database migrations, provider configuration, and end-to-end verification.

## Current capabilities

| Area | Present in the source | Delivery status |
| --- | --- | --- |
| Funnels | Visual and JSON builders, templates, AI generation, public funnels at `/f/[slug]` | Verify draft → publish → public lead capture in the target environment. |
| Campaign workspace | Product-link ingestion or written descriptions, keyword selection, generated funnel/article/email bundles, saved drafts, editing, publish now, and scheduled external publishing | Verify content accuracy and CMS/webhook delivery. Generated emails do not establish sequence enrollment. |
| Lead magnets | Downloads workspace, uploads, and gated delivery | Verify storage access, capture, and the delivered file. |
| Email automation | Built-in subscribers, automations, campaigns, delayed jobs, and AWS SES transport | Verify durable storage, sender configuration, enrollment, delayed sends, and received messages. |
| Traffic and analytics | Click/conversion tracking, UTM attribution, dashboards, and analytics APIs | Verify attribution with controlled visits and conversions. Tracking does not create advertising traffic. |
| Billing and teams | Stripe checkout/subscription routes, subscription management, and team access | Verify webhook processing, entitlements, and permissions with test resources. |
| Optimization | AI suggestions, variation generation, and A/B-related schema | Verify traffic splitting, attribution, and winner selection before claiming automatic A/B optimization is complete. |
| Members advertising area | Paid memberships and display advertising revenue are requested product work | Verify or complete the dedicated members experience, ad placements, and revenue integration. Subscription billing alone does not establish this workflow. |

## BrandBrain and personality rules

Use **Launchpad4 Success** in product copy. Existing repository and package identifiers remain unchanged.

Keep the client's selected personality consistent across funnel copy, advertising, lead magnets, and follow-up emails. Do not mix the voices.

| Character | Personality | Voice |
| --- | --- | --- |
| Glitch | AI Meltdown | Sarcastic parody from a tired, overworked AI. Reuse the locked, approved Glitch face for advertising and funnel imagery. |
| Anchor | Anti-Guru | Direct, honest, practical, and opposed to hype or unsupported income claims. |
| Boost | Rocket Future / Rocket | Optimistic, patient guidance toward achievable progress. |

These are brand requirements, not a claim that every generation path already enforces them. Some campaign APIs currently accept generic tone values; verify personality propagation through generated emails and advertising before shipping changes.

Start with the [canonical personality definitions](apps/web/src/lib/personality/canonical-definitions.ts), [personality system](apps/web/src/lib/personality/README.md), [BrandBrain guide](docs/BRANDBRAIN.md), and [voice rules](docs/codex/VOICE_RULES.md). Preserve approved character references and locked canon unless explicitly authorized to change them.

## Technology and repository layout

| Layer | Repository configuration |
| --- | --- |
| Web app | Next.js 16, React 18, TypeScript, Tailwind CSS |
| Workspace | npm workspaces and Turborepo |
| Database, authentication, storage | Supabase |
| AI generation | OpenAI integrations; model selection varies by implementation |
| Email | Built-in autoresponder and AWS SES transport |
| Billing | Stripe |
| Hosting | Vercel |

Use [apps/web/package.json](apps/web/package.json) and the lockfile for dependency versions. CI uses Node.js 22; [package.json](package.json) declares npm 10.2.4.

- `apps/web/`: main application, API routes, feature services, and tests.
- `packages/`: shared AI, voice, UI, SDK, and module code.
- `infra/`: base schema, legacy migrations, and migration helpers.
- `supabase/`: CLI configuration and timestamped migrations.
- `apps/web/supabase/migrations/`: additional application migrations.
- `docs/`: architecture, personality, integration, and operations guides.

## Local development

Run commands from the repository root unless stated otherwise.

### 1. Install dependencies

Use Node.js 22 to match CI, with npm available.

```bash
npm ci --include=optional
cp apps/web/.env.example apps/web/.env.local
```

### 2. Configure the web app

Edit `apps/web/.env.local` using [the environment template](apps/web/.env.example).

| Configuration | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL; must match the project's public key. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public key accepted by the build validator; the template currently shows the legacy anon variable. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server operations such as persistent email queues and publishing. Keep private. |
| `OPENAI_API_KEY` | AI generation; some paths have fallback output that needs review. |
| `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BASE_URL` | Local or deployed application URLs. |
| `EMAIL_PROVIDER` | `autoresponder` by default, or `ses` for direct transport. |
| `EMAIL_DEFAULT_FROM`, `EMAIL_DEFAULT_FROM_NAME` | Sender identity and display name. |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | SES settings shown in the template; the transport also supports the AWS credential chain. |
| `SES_CONFIGURATION_SET` | Optional SES configuration set, if used. |
| `AUTORESPONDER_CRON_SECRET`, `CRON_SECRET`, `PUBLISH_CRON_SECRET` | Email and publishing runner authentication. |
| `STRIPE_*`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Billing keys, webhook secret, and price IDs listed in the template. |

The build validator requires the Supabase URL and one supported public-key variable. Passing it does not verify email, billing, storage, or AI credentials.

Never commit real credentials or put service-role, AWS, Stripe secret, or OpenAI keys in `NEXT_PUBLIC_*` variables. Keep local/test and production resources separate.

### 3. Prepare the database

For a fresh database, start with [infra/supabase-schema.sql](infra/supabase-schema.sql), then follow the migration dependency order in [infra/README.md](infra/README.md). For an existing database, inspect applied migration history first.

Migration files exist in multiple directories. Reconcile them before applying changes; applying only `supabase/migrations/` does not establish that the full legacy schema is installed.

The helper `infra/apply-migrations.js` validates/simulates execution; it does not apply SQL. Use the documented manual or SQL execution workflow and verify required tables, policies, and storage access afterward.

### 4. Start the main app

```bash
npm run dev:web
```

Open <http://localhost:3000>. Use `npm run dev` to run workspace development tasks through Turborepo.

## Email capture and follow-up

Active provider selection lives in [email/service.ts](apps/web/src/lib/email/service.ts):

- `EMAIL_PROVIDER=autoresponder` uses the built-in engine with Supabase persistence and SES transport.
- `EMAIL_PROVIDER=ses` uses direct SES delivery and in-memory template/automation stores. The autoresponder queue runner does no work in this mode.
- Unrecognized values fall back to `autoresponder`. Legacy SendShark configuration does not activate a SendShark API integration in this service.

The historical filename [docs/SENDSHARK.md](docs/SENDSHARK.md) now documents the built-in integration.

The signup flow is:

1. `POST /api/leads/capture` saves the lead and attempts to record a lead analytics event.
2. It attempts subscriber enrollment with funnel and attribution details.
3. In autoresponder mode, active signup sequences are triggered.
4. Immediate steps attempt SES delivery; delayed steps are queued for the runner.

A successful capture response does **not** confirm enrollment or delivery: the capture route logs email errors and continues. Check the subscriber, queued job, provider result, and received message separately.

The autoresponder has in-memory fallbacks when database configuration or schema is unavailable. These do not survive server restarts or reliably span serverless instances. Production follow-up needs working Supabase persistence and SES delivery.

Default welcome/cart templates exist, but this does not prove cart events are connected or that each sequence preserves the client's personality. Generated campaign emails also need to be connected to the intended follow-up workflow.

## Scheduling and delivery

[vercel.json](vercel.json) currently declares daily schedules in UTC:

| Runner | Schedule | Configuration |
| --- | --- | --- |
| `/api/email/autoresponder/run` | `0 0 * * *` — 00:00 UTC | Bearer token or `x-autoresponder-secret` matching `AUTORESPONDER_CRON_SECRET` or `CRON_SECRET`. |
| `/api/publish/run` | `0 3 * * *` — 03:00 UTC | Configure `PUBLISH_CRON_SECRET` and/or `CRON_SECRET`; bearer authentication is supported. |

Set `CRON_SECRET` for authenticated Vercel cron calls. Keeping it equal to `AUTORESPONDER_CRON_SECRET` follows the environment template.

Due jobs can wait until the next daily invocation. An hourly email delay or five-minute publishing time does not make the runner execute at that interval. Check hosting constraints and required delivery timing before adjusting the scheduler.

Scheduled external campaign publishing requires an active CMS/webhook integration and a time at least five minutes ahead. Publish Now makes the linked funnel public; it does not itself deliver the generated emails.

See the [content automation runbook](docs/CONTENT_AUTOMATION_RUNBOOK.md) for publishing retries, failures, and troubleshooting.

## Main routes

| Route | Purpose |
| --- | --- |
| `/login`, `/signup` | Account access |
| `/launchpad` | Campaign workspace |
| `/funnels`, `/visual-builder`, `/builder` | Funnel management and editing |
| `/f/[slug]`, `/p/[slug]` | Public funnels and pages |
| `/content-automation` | Content generation, drafts, and publishing |
| `/downloads` | Lead magnets and downloads |
| `/email`, `/subscribers` | Email workspace and subscribers |
| `/dashboard`, `/analytics` | Performance and attribution |
| `/offers`, `/integrations`, `/domains` | Offers, integrations, and domains |
| `/subscription` | Subscription management |
| `/team` | Team collaboration |
| `/admin/analytics` | Admin analytics |

## API entry points

| Area | Entry points |
| --- | --- |
| Funnels | `/api/funnels`, `/api/funnels/[id]`, `/api/funnels/public/[slug]` |
| Lead capture | `/api/leads/capture` |
| Downloads | `/api/uploads`, `/api/downloads/[id]` |
| Email | `/api/email/send`, `/api/email/templates`, `/api/email/automation`, `/api/email/reports` |
| Email runner | `/api/email/autoresponder/run` |
| Tracking | `/api/track/click`, `/api/track/affiliate-click`, `/api/track/conversion` |
| Analytics | `/api/analytics`, `/api/analytics/[funnelId]`, `/api/analytics/realtime` |
| BrandBrain | `/api/brand-brain`, `/api/brand-brain/system-prompt`, `/api/brand-brain/validate` |
| Content and drafts | `/api/content/generate`, `/api/content/campaign`, `/api/content/campaign/[campaignId]` |
| Campaign publication | `/api/content/campaign/[campaignId]/publish` |
| Publishing | `/api/publish/schedule`, `/api/publish/run` |
| Integrations | `/api/integrations/google/keywords`, `/api/integrations/cms` |
| Subscriptions | `/api/stripe/create-subscription-checkout`, `/api/stripe/create-portal-session`, `/api/stripe/webhook` |

Consult route handlers for supported methods, request bodies, authentication, and responses.

## Checks and deployment

From the repository root:

```bash
npm run lint:md
npm run lint --workspace=apps/web
npm run type-check --workspace=apps/web
npm run test:run --workspace=apps/web
npm run build --workspace=apps/web
```

After a successful web build, serve it locally with:

```bash
npm run start --workspace=apps/web
```

Use the guarded commands described in [DEPLOYMENT.md](DEPLOYMENT.md):

```bash
npm run deploy:check
npm run deploy:preview
npm run deploy
```

The guard checks the existing Vercel project link. Configure variables in the target environment before deploying.

Before treating a release as ready, verify the public funnel, capture, delivered download, email enrollment and receipt, delayed jobs, attribution, and test-mode subscription lifecycle. Inspect ownership and database policies; this README is not a security audit.

## Documentation

- [Architecture and ownership invariants](docs/ARCHITECTURE_INVARIANTS.md)
- [AI rules](docs/codex/AI_RULES.md) and [prompt architecture](docs/AI_PROMPT_ARCHITECTURE.md)
- [BrandBrain](docs/BRANDBRAIN.md) and [personality context](docs/PERSONALITY_CONTEXT.md)
- [Downloads setup](DOWNLOADS_SETUP.md) and [download documentation](docs/DOWNLOADS.md)
- [Email integration](docs/SENDSHARK.md) and [environment template](apps/web/.env.example)
- [Content automation scope](docs/CONTENT_AUTOMATION_SCOPE.md), [API contracts](docs/CONTENT_AUTOMATION_API_CONTRACTS.md), and [runbook](docs/CONTENT_AUTOMATION_RUNBOOK.md)
- [Tracking](docs/TRACKING.md) and [team collaboration](docs/TEAM_COLLABORATION.md)
- [Database migrations](infra/README.md) and [deployment](DEPLOYMENT.md)

Some historical guides describe earlier integrations or planned architecture. Check current route handlers, services, scripts, and migrations when a guide conflicts with the code.

## License

Proprietary — all rights reserved.
