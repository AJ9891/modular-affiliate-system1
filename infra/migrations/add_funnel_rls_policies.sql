-- ============================================
-- FUNNEL RLS POLICIES
-- Add status field and comprehensive RLS policies for funnels and pages
-- ============================================

-- Add status column to funnels if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
    and table_name = 'funnels'
    and column_name = 'status'
  ) then
    alter table public.funnels add column status text check (status in ('draft', 'published', 'archived')) default 'draft';
    create index if not exists idx_funnels_status on public.funnels(status);
  end if;
end $$;

-- Rename pages table to funnel_pages for clarity (if not already done)
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
    and table_name = 'pages'
  ) and not exists (
    select 1 from information_schema.tables
    where table_schema = 'public'
    and table_name = 'funnel_pages'
  ) then
    alter table public.pages rename to funnel_pages;
  end if;
end $$;

-- Ensure RLS is enabled
alter table public.funnels enable row level security;
alter table public.funnel_pages enable row level security;

-- ============================================
-- DROP OLD POLICIES (if they exist)
-- ============================================

drop policy if exists "Users can manage their own funnels" on public.funnels;
drop policy if exists "Users can read their funnels" on public.funnels;
drop policy if exists "Users can create funnels" on public.funnels;
drop policy if exists "Users can update their funnels" on public.funnels;
drop policy if exists "Users can delete their funnels" on public.funnels;
drop policy if exists "Public can read published funnels" on public.funnels;

drop policy if exists "Users can read their funnel pages" on public.funnel_pages;
drop policy if exists "Users can create funnel pages" on public.funnel_pages;
drop policy if exists "Users can update funnel pages" on public.funnel_pages;
drop policy if exists "Users can delete funnel pages" on public.funnel_pages;
drop policy if exists "Public can read pages of published funnels" on public.funnel_pages;

-- ============================================
-- FUNNELS — OWNER ACCESS (FULL CONTROL)
-- ============================================

-- Read your own funnels
create policy "Users can read their funnels"
on public.funnels
for select
using (auth.uid() = user_id);

-- Insert funnels
create policy "Users can create funnels"
on public.funnels
for insert
with check (auth.uid() = user_id);

-- Update funnels
create policy "Users can update their funnels"
on public.funnels
for update
using (auth.uid() = user_id);

-- Delete funnels
create policy "Users can delete their funnels"
on public.funnels
for delete
using (auth.uid() = user_id);

-- ============================================
-- FUNNELS — PUBLIC READ (PUBLISHED ONLY)
-- ============================================

-- Public can read published funnels (for live landing pages)
-- This OR's with the owner policies - owner OR published = readable
create policy "Public can read published funnels"
on public.funnels
for select
using (status = 'published');

-- ============================================
-- FUNNEL PAGES — OWNER ACCESS
-- ============================================

-- Read pages you own (via funnel ownership)
create policy "Users can read their funnel pages"
on public.funnel_pages
for select
using (
  exists (
    select 1
    from public.funnels
    where funnels.funnel_id = funnel_pages.funnel_id
      and funnels.user_id = auth.uid()
  )
);

-- Create pages (must own the funnel)
create policy "Users can create funnel pages"
on public.funnel_pages
for insert
with check (
  exists (
    select 1
    from public.funnels
    where funnels.funnel_id = funnel_pages.funnel_id
      and funnels.user_id = auth.uid()
  )
);

-- Update pages (must own the funnel)
create policy "Users can update funnel pages"
on public.funnel_pages
for update
using (
  exists (
    select 1
    from public.funnels
    where funnels.funnel_id = funnel_pages.funnel_id
      and funnels.user_id = auth.uid()
  )
);

-- Delete pages (must own the funnel)
create policy "Users can delete funnel pages"
on public.funnel_pages
for delete
using (
  exists (
    select 1
    from public.funnels
    where funnels.funnel_id = funnel_pages.funnel_id
      and funnels.user_id = auth.uid()
  )
);

-- ============================================
-- FUNNEL PAGES — PUBLIC READ (PUBLISHED FUNNELS)
-- ============================================

-- Public can read pages of published funnels (crucial for live pages)
create policy "Public can read pages of published funnels"
on public.funnel_pages
for select
using (
  exists (
    select 1
    from public.funnels
    where funnels.funnel_id = funnel_pages.funnel_id
      and funnels.status = 'published'
  )
);

-- ============================================
-- COMMENTS AND VERIFICATION
-- ============================================

comment on table public.funnels is 'Funnels with status field (draft/published/archived) and granular RLS policies';
comment on table public.funnel_pages is 'Individual pages within funnels, inheriting access via funnel ownership';

comment on column public.funnels.status is 'Funnel publication status: draft = private, published = public, archived = hidden';

-- Verification queries:
-- 
-- Check published funnels (should return rows when published):
--   select * from funnels where status = 'published';
-- 
-- Check draft funnels as anon (should fail):
--   select * from funnels where status = 'draft';
-- 
-- Check pages visibility:
--   select * from funnel_pages;
