-- Downloads (lead magnets, ebooks, digital products)
create table if not exists public.downloads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id),
  title text not null,
  description text,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  file_type text not null,
  storage_url text not null,
  download_count integer default 0,
  is_active boolean default true,
  require_email boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Download tracking (who downloaded what)
create table if not exists public.download_logs (
  id uuid default gen_random_uuid() primary key,
  download_id uuid references public.downloads(id),
  email text not null,
  ip_address text,
  user_agent text,
  funnel_id uuid references public.funnels(funnel_id),
  downloaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.downloads enable row level security;
alter table public.download_logs enable row level security;

-- Create policies
create policy "Users can manage their own downloads" on public.downloads
  for all using (auth.uid() = user_id);

create policy "Users can view download logs for their downloads" on public.download_logs
  for select using (exists (
    select 1 from public.downloads 
    where downloads.id = download_logs.download_id 
    and downloads.user_id = auth.uid()
  ));

-- Create indexes
create index idx_downloads_user_id on public.downloads(user_id);
create index idx_download_logs_download_id on public.download_logs(download_id);
create index idx_download_logs_email on public.download_logs(email);

-- Create storage bucket for downloads
insert into storage.buckets (id, name, public)
values ('downloads', 'downloads', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Users can upload their own files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their own files"
on storage.objects for select
to authenticated
using (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Public access to files"
on storage.objects for select
to public
using (bucket_id = 'downloads');
