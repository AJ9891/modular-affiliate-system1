-- Add Stripe Connect fields for affiliate payouts
alter table public.users add column if not exists stripe_connect_account_id text;
alter table public.users add column if not exists stripe_connect_onboarding_complete boolean default false;
alter table public.users add column if not exists stripe_connect_charges_enabled boolean default false;
alter table public.users add column if not exists stripe_connect_payouts_enabled boolean default false;

-- Index for Stripe Connect accounts
create index if not exists idx_users_stripe_connect_account_id on public.users(stripe_connect_account_id) where stripe_connect_account_id is not null;

-- Affiliate payouts table
create table if not exists public.affiliate_payouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) not null,
  amount decimal(10,2) not null,
  currency text default 'usd',
  stripe_transfer_id text,
  status text check (status in ('pending', 'paid', 'failed')) default 'pending',
  payout_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for affiliate payouts
create index if not exists idx_affiliate_payouts_user_id on public.affiliate_payouts(user_id);
create index if not exists idx_affiliate_payouts_status on public.affiliate_payouts(status);

comment on table public.affiliate_payouts is 'Tracks affiliate commission payouts via Stripe Connect';
comment on column public.affiliate_payouts.stripe_transfer_id is 'Stripe transfer ID for the payout';