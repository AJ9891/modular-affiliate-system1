-- Persist generated campaigns as user-owned drafts.

create table if not exists public.campaigns (
  campaign_id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  title text not null,
  goal text not null
    check (goal in ('sales', 'leads', 'traffic', 'promotion')),
  tone text not null
    check (tone in ('professional', 'casual', 'urgent', 'friendly')),
  source_url text,
  product_description text,
  keyword text not null,
  ingestion jsonb not null default '{}'::jsonb,
  content jsonb not null,
  warnings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.campaigns enable row level security;

create policy "Users can read their own campaigns"
  on public.campaigns
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own campaigns"
  on public.campaigns
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create index if not exists campaigns_user_updated_idx
  on public.campaigns (user_id, updated_at desc);

create index if not exists campaigns_funnel_id_idx
  on public.campaigns (funnel_id)
  where funnel_id is not null;

grant select, insert, update, delete on table public.campaigns to authenticated;
grant select, insert, update, delete on table public.campaigns to service_role;
