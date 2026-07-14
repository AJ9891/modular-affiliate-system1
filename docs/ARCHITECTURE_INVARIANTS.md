# Architecture Invariants

These rules are the platform's architectural constitution. UI checks improve
feedback; server code, transactions, constraints, and RLS enforce truth.

## Vocabulary

- **Launchpad**: a user-owned campaign workspace.
- **Funnel**: a user-owned public conversion page.
- **Offer**: an affiliate destination attached to a funnel.
- **Lead magnet**: a downloadable asset exchanged for contact information.
- **Sequence**: an automated email series.
- **Template**: an immutable reusable source cloned into a funnel instance.

## Ownership and authorization

1. Every launchpad, funnel, offer, job, event, and version has an accountable owner.
2. Every mutation checks both the resource ID and authenticated owner ID.
3. RLS repeats the ownership rule; frontend checks are convenience only.
4. Only trusted server code changes plans, entitlements, billing identifiers,
   administration flags, capacity, or provisioning status.

## Workflow and publication

1. Onboarding completion is user-level; launch progress is launchpad-level.
2. Draft data never implies step completion. Completion requires an explicit
   validated completion timestamp.
3. A launchpad stays pinned to the workflow version under which it was created.
4. A live launchpad has a published funnel owned by the same user.
5. Publishing recalculates readiness from authoritative server data.
6. Onboarding completion never publishes a launchpad or funnel.
7. Workflow mutations use optimistic concurrency and reject stale versions.

## Capacity and entitlements

1. Capacity counts non-deleted, non-archived launchpads.
2. A Starter user may have at most one active launchpad; Pro may have 20.
3. Entitlements are permissions; plan names are billing labels.
4. Database constraints and atomic operations are the final quota boundary.

## Reliability and recovery

1. Important creation and provider operations are idempotent.
2. Slow work runs as durable jobs and can be resumed after refresh.
3. Launchpad events are append-only and written with the state mutation they describe.
4. Templates are never mutated when a funnel is customized.
5. Major funnel changes snapshot the previous state in `funnel_versions`.
6. Domain entities are soft-deleted and excluded from ordinary reads.
7. Provider and database errors are translated into calm domain messages.

## Environments

Local, preview/staging, and production use separate Supabase resources, Stripe
keys, webhook secrets, provider behavior, Vercel variables, and OpenAI limits.
Billing or provisioning tests must never target production customers.

## Migration checklist

Every schema change includes a forward migration, safe defaults, a backfill,
constraints, documentation, and verification queries. Production schema changes
must never exist only as manual dashboard edits.
