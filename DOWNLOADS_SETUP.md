# Quick Setup: Downloads & Lead Magnets

## Step 1: Run Database Migration

Copy the entire contents below and paste into your **Supabase SQL Editor**:

```sql
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
```

## Step 2: Create Storage Bucket

In your **Supabase Dashboard**:

1. Go to **Storage** in the left sidebar
2. Click **New bucket**
3. Name: `downloads`
4. Set to **Public bucket** ✅
5. Click **Create bucket**

## Step 3: Set Storage Policies

Go to **Storage** → **downloads** bucket → **Policies** tab, then paste these:

### Policy 1: Users can upload their own files
```sql
create policy "Users can upload their own files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 2: Users can view their own files
```sql
create policy "Users can view their own files"
on storage.objects for select
to authenticated
using (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 3: Users can delete their own files
```sql
create policy "Users can delete their own files"
on storage.objects for delete
to authenticated
using (bucket_id = 'downloads' and (storage.foldername(name))[1] = auth.uid()::text);
```

### Policy 4: Public access to files
```sql
create policy "Public access to files"
on storage.objects for select
to public
using (bucket_id = 'downloads');
```

## Step 4: Test the System

1. Restart your dev server (if running)
2. Navigate to **http://localhost:3000/downloads**
3. Upload a test PDF or document
4. Copy the download link
5. Test the download in an incognito window

## Step 5: Use in Funnels

Add to any page:

```tsx
import DownloadGate from '@/components/DownloadGate';

<DownloadGate
  downloadId="paste-your-download-id-here"
  title="Get Your Free Guide"
  description="Enter email for instant access"
  buttonText="Download Now"
/>
```

## ✅ Done!

You now have:
- ✅ File upload system
- ✅ Email capture before download
- ✅ Download tracking
- ✅ Lead generation
- ✅ Analytics

## 🔗 Next Steps

- Read full docs: `/docs/DOWNLOADS.md`
- See example: `/example-download`
- View your downloads: `/downloads`
