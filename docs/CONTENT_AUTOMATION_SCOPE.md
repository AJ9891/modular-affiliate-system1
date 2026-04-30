# Content Automation Scope

Date: April 30, 2026

## Requested Feature Scope

This implementation intentionally includes only:

1. AI generation
2. Scheduled posting of generated content (articles and funnels/pages)
3. Google keyword lookup integration

## Explicitly Out of Scope

- Backlink exchange network
- Technical audit engine
- Reddit opportunity tooling
- Full white-label tenanting
- Multi-CMS native adapters in v1 (webhook adapter first)

## MVP Architecture

- New UI workspace: `/content-automation`
- New API groups:
  - `/api/content/generate`
  - `/api/integrations/google/keywords`
  - `/api/integrations/cms`
  - `/api/publish/schedule`
  - `/api/publish/run`
- New data objects:
  - Keyword project and keyword rows
  - Content schedule rows
  - Publish job history rows
  - CMS integration settings rows

## Delivery Notes

- AI generation reuses existing generation primitives and normalizes output for article + funnel publishing.
- Google keyword lookup v1 uses Google Autocomplete endpoint integration for fast no-console setup.
- Scheduled publishing v1 uses webhook adapter first for immediate cross-platform compatibility.
