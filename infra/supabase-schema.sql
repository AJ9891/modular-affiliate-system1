-- Users table (handled by Supabase Auth, but we can extend it)
create table if not exists public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Niches (module definitions)
create table if not exists public.niches (
  id uuid default gen_random_uuid() primary key,
  module_id text unique not null,
  name text not null,
  version text not null,
  active boolean default false,
  config jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Offers (affiliate offers)
create table if not exists public.offers (
  id uuid default gen_random_uuid() primary key,
  niche_id uuid references public.niches(id),
  name text not null,
  description text,
  affiliate_link text not null,
  commission_rate decimal(5,2),
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Funnels
create table if not exists public.funnels (
  funnel_id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  niche_id uuid references public.niches(id),
  name text not null,
  blocks jsonb not null,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pages (individual funnel pages)
create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  funnel_id uuid references public.funnels(funnel_id) on delete cascade,
  name text not null,
  path text not null,
  content jsonb not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Clicks (tracking)
create table if not exists public.clicks (
  click_id uuid default gen_random_uuid() primary key,
  offer_id uuid references public.offers(id),
  funnel_id uuid references public.funnels(funnel_id),
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  ip_address inet,
  clicked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Conversions
create table if not exists public.conversions (
  conversion_id uuid default gen_random_uuid() primary key,
  click_id uuid references public.clicks(click_id),
  offer_id uuid references public.offers(id),
  amount decimal(10,2),
  order_id text,
  converted_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Templates
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  niche_id uuid references public.niches(id),
  name text not null,
  type text not null check (type in ('page', 'email', 'block')),
  content jsonb not null,
  preview_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Theme presets
create table if not exists public.theme_presets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  colors jsonb not null,
  fonts jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.niches enable row level security;
alter table public.offers enable row level security;
alter table public.funnels enable row level security;
alter table public.pages enable row level security;
alter table public.clicks enable row level security;
alter table public.conversions enable row level security;
alter table public.templates enable row level security;
alter table public.theme_presets enable row level security;

-- Create policies (basic examples - customize as needed)
create policy "Users can view their own data" on public.users
  for select using (auth.uid() = id);

create policy "Anyone can view active niches" on public.niches
  for select using (active = true);

create policy "Users can manage their own funnels" on public.funnels
  for all using (auth.uid() = user_id);

create policy "Anyone can view active offers" on public.offers
  for select using (active = true);

-- Create indexes for performance
create index idx_clicks_funnel_id on public.clicks(funnel_id);
create index idx_clicks_offer_id on public.clicks(offer_id);
create index idx_clicks_clicked_at on public.clicks(clicked_at);
create index idx_conversions_click_id on public.conversions(click_id);
create index idx_conversions_converted_at on public.conversions(converted_at);
create index idx_funnels_user_id on public.funnels(user_id);
create index idx_funnels_niche_id on public.funnels(niche_id);
