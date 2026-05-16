alter table public.beta_testers
  add column if not exists invite_token text unique,
  add column if not exists invite_sent_at timestamp with time zone,
  add column if not exists invite_accepted_at timestamp with time zone,
  add column if not exists accepted_user_id uuid references public.users(id);

create index if not exists idx_beta_testers_invite_token
  on public.beta_testers(invite_token)
  where invite_token is not null;
