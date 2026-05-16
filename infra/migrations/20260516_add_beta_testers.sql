create table if not exists public.beta_testers (
  id uuid default gen_random_uuid() primary key,
    email text not null unique,
      full_name text,
        company text,
          status text not null default 'prospect' check (status in ('prospect', 'invited', 'active', 'paused')),
            notes text,
              invited_at timestamp with time zone,
                created_by uuid references public.users(id),
                  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
                    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
                    );

                    create index if not exists idx_beta_testers_status on public.beta_testers(status);
                    create index if not exists idx_beta_testers_created_at on public.beta_testers(created_at desc);

                    alter table public.beta_testers enable row level security;

                    drop policy if exists "Service manage beta testers" on public.beta_testers;
                    create policy "Service manage beta testers"
                      on public.beta_testers
                        for all
                          to service_role
                            using (true)
                              with check (true);
                              