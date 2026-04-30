-- Content automation core tables: keywords, schedule, publishing integrations

create table if not exists public.google_keyword_projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  seed_query text,
  locale text default 'en-US',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.google_keywords (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.google_keyword_projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  keyword text not null,
  source text not null default 'google_autocomplete',
  search_volume integer,
  difficulty numeric(5,2),
  cpc numeric(10,4),
  competition text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, keyword)
);

create table if not exists public.cms_integrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  provider text not null,
  target_url text not null,
  auth_type text not null default 'none',
  auth_value text,
  config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_test_status text,
  last_error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.content_schedule (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  run_at timestamp with time zone not null,
  status text not null default 'queued' check (status in ('queued', 'published', 'failed', 'cancelled')),
  content_type text not null default 'article_and_funnel',
  content_payload jsonb not null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.publish_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  schedule_id uuid references public.content_schedule(id) on delete cascade not null,
  cms_integration_id uuid references public.cms_integrations(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  attempt integer not null default 0,
  error_message text,
  response_payload jsonb,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.google_keyword_projects enable row level security;
alter table public.google_keywords enable row level security;
alter table public.cms_integrations enable row level security;
alter table public.content_schedule enable row level security;
alter table public.publish_jobs enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'google_keyword_projects' and policyname = 'Users can manage their own keyword projects') then
    create policy "Users can manage their own keyword projects"
      on public.google_keyword_projects
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'google_keywords' and policyname = 'Users can manage their own keywords') then
    create policy "Users can manage their own keywords"
      on public.google_keywords
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'cms_integrations' and policyname = 'Users can manage their own cms integrations') then
    create policy "Users can manage their own cms integrations"
      on public.cms_integrations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'content_schedule' and policyname = 'Users can manage their own content schedule') then
    create policy "Users can manage their own content schedule"
      on public.content_schedule
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'publish_jobs' and policyname = 'Users can view their own publish jobs') then
    create policy "Users can view their own publish jobs"
      on public.publish_jobs
      for select
      using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists idx_google_keyword_projects_user_id on public.google_keyword_projects(user_id);
create index if not exists idx_google_keywords_project_id on public.google_keywords(project_id);
create index if not exists idx_google_keywords_user_id on public.google_keywords(user_id);
create index if not exists idx_cms_integrations_user_id on public.cms_integrations(user_id);
create index if not exists idx_content_schedule_user_id on public.content_schedule(user_id);
create index if not exists idx_content_schedule_run_at on public.content_schedule(run_at);
create index if not exists idx_content_schedule_status on public.content_schedule(status);
create index if not exists idx_publish_jobs_schedule_id on public.publish_jobs(schedule_id);
create index if not exists idx_publish_jobs_user_id on public.publish_jobs(user_id);
