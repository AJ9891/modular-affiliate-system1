import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('Running Stripe Connect migration...')

    // Add Stripe Connect columns to users table
    const { error: alterError } = await supabase.rpc('exec', {
      sql: `
        alter table public.users add column if not exists stripe_connect_account_id text;
        alter table public.users add column if not exists stripe_connect_onboarding_complete boolean default false;
        alter table public.users add column if not exists stripe_connect_charges_enabled boolean default false;
        alter table public.users add column if not exists stripe_connect_payouts_enabled boolean default false;
      `
    })

    if (alterError) {
      console.error('Error adding columns:', alterError)
    } else {
      console.log('Added Stripe Connect columns to users table')
    }

    // Create affiliate_payouts table
    const { error: tableError } = await supabase.rpc('exec', {
      sql: `
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
      `
    })

    if (tableError) {
      console.error('Error creating payouts table:', tableError)
    } else {
      console.log('Created affiliate_payouts table')
    }

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration error:', error)
  }
}

runMigration()