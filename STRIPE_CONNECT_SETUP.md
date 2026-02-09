# Stripe Connect Setup for Affiliate Payouts

## Overview

Stripe Connect allows affiliates to receive payments directly to their bank accounts. This setup enables:

- Secure bank account connections
- Automatic payouts for commissions
- Compliance with payment regulations

## Database Setup Required

Run this SQL in your Supabase SQL Editor:

```sql
-- Add Stripe Connect fields to users table
alter table public.users add column if not exists stripe_connect_account_id text;
alter table public.users add column if not exists stripe_connect_onboarding_complete boolean default false;
alter table public.users add column if not exists stripe_connect_charges_enabled boolean default false;
alter table public.users add column if not exists stripe_connect_payouts_enabled boolean default false;

-- Create affiliate payouts table
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

-- Add indexes
create index if not exists idx_users_stripe_connect_account_id on public.users(stripe_connect_account_id) where stripe_connect_account_id is not null;
create index if not exists idx_affiliate_payouts_user_id on public.affiliate_payouts(user_id);
create index if not exists idx_affiliate_payouts_status on public.affiliate_payouts(status);
```

## Setup Steps for Jacob

1. **Sign up for an account** at your affiliate system
2. **Get admin access** (you'll need to run the set-admin script)
3. **Connect Stripe account** from the dashboard
4. **Complete onboarding** through Stripe's secure process

## API Endpoints Created

- `POST /api/stripe/connect/onboard` - Start Stripe Connect onboarding
- `GET /api/stripe/connect/status` - Check connection status
- `POST /api/stripe/connect/payout` - Process payouts (admin only)

## How It Works

1. **Affiliate connects bank account** → Stripe creates Express account
2. **Admin processes commission** → Transfer sent to affiliate's account
3. **Stripe handles compliance** → Automatic payouts to bank account

## Security Features

- PCI compliant payment processing
- Bank-level security for account connections
- Automatic fraud detection
- Regulatory compliance (KYC, AML)

## Testing

For development, use Stripe test mode with these test bank details:

- Routing number: `110000000`
- Account number: `000123456789`
- Account holder name: Any name
