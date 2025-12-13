-- Affiliate Clicks Table
-- Tracks partner referral clicks (e.g., SendShark activations)

create table if not exists public.affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  partner text not null,
  source text,
  metadata jsonb,
  clicked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_affiliate_clicks_partner on public.affiliate_clicks(partner);
create index if not exists idx_affiliate_clicks_user_id on public.affiliate_clicks(user_id);

comment on table public.affiliate_clicks is 'Tracks affiliate partner link clicks for analytics and attribution';
comment on column public.affiliate_clicks.partner is 'Partner identifier (e.g., sendshark, clickbank)';
comment on column public.affiliate_clicks.source is 'Traffic source (e.g., sales-bot, dashboard, email)';
