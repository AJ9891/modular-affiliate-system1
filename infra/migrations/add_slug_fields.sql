-- Add slug fields to funnels and pages tables
alter table public.funnels add column if not exists slug text unique;
alter table public.pages add column if not exists slug text;

-- Create indexes for slug lookups
create index if not exists idx_funnels_slug on public.funnels(slug);
create index if not exists idx_pages_slug on public.pages(slug);