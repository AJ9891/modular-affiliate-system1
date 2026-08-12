-- Keep each Stripe Connect account assigned to exactly one Launchpad user.
drop index if exists public.idx_users_stripe_connect_account_id;

create unique index idx_users_stripe_connect_account_id
  on public.users (stripe_connect_account_id)
  where stripe_connect_account_id is not null;
