-- Funnel generation persistence (Phase 3)
-- Stores per-run lifecycle and generated artifacts for link-based funnel generation.

create table if not exists public.funnel_generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  funnel_id uuid references public.funnels(funnel_id) on delete set null,
  source_url text not null,
  status text not null check (status in ('running', 'completed', 'failed')) default 'running',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  error_message text
);

create table if not exists public.generated_assets (
  id uuid default gen_random_uuid() primary key,
  generation_id uuid references public.funnel_generations(id) on delete cascade not null,
  asset_type text not null,
  content_json jsonb,
  content_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint generated_assets_asset_type_check check (
    asset_type in ('landing', 'email_sequence', 'offer_signals', 'raw')
  )
);

create index if not exists idx_funnel_generations_user_id on public.funnel_generations(user_id);
create index if not exists idx_funnel_generations_funnel_id on public.funnel_generations(funnel_id);
create index if not exists idx_funnel_generations_status on public.funnel_generations(status);
create index if not exists idx_funnel_generations_started_at on public.funnel_generations(started_at desc);

create index if not exists idx_generated_assets_generation_id on public.generated_assets(generation_id);
create index if not exists idx_generated_assets_type on public.generated_assets(asset_type);

alter table public.funnel_generations enable row level security;
alter table public.generated_assets enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'funnel_generations' and policyname = 'Users can manage their own funnel generations'
  ) then
    create policy "Users can manage their own funnel generations"
      on public.funnel_generations
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'generated_assets' and policyname = 'Users can manage generated assets for own generations'
  ) then
    create policy "Users can manage generated assets for own generations"
      on public.generated_assets
      for all
      using (
        exists (
          select 1
          from public.funnel_generations fg
          where fg.id = generated_assets.generation_id
            and fg.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1
          from public.funnel_generations fg
          where fg.id = generated_assets.generation_id
            and fg.user_id = auth.uid()
        )
      );
  end if;
end $$;

grant select, insert, update, delete on public.funnel_generations to authenticated;
grant select, insert, update, delete on public.generated_assets to authenticated;
