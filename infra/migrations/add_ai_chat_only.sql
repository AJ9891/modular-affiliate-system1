-- AI Support Chat Migration (Minimal)
-- Only creates chat tables if they don't exist
-- Safe to run multiple times

-- Chat conversations
create table if not exists public.chat_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text,
  status text check (status in ('active', 'resolved', 'archived')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  role text check (role in ('user', 'assistant', 'system')) not null,
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for chat performance
create index if not exists idx_chat_conversations_user on public.chat_conversations(user_id);
create index if not exists idx_chat_conversations_status on public.chat_conversations(status);
create index if not exists idx_chat_messages_conversation on public.chat_messages(conversation_id);
create index if not exists idx_chat_messages_created on public.chat_messages(created_at);

-- RLS for chat conversations
alter table public.chat_conversations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can view their own conversations') then
    create policy "Users can view their own conversations" on public.chat_conversations for select using (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can create their own conversations') then
    create policy "Users can create their own conversations" on public.chat_conversations for insert with check (auth.uid() = user_id);
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_conversations' and policyname = 'Users can update their own conversations') then
    create policy "Users can update their own conversations" on public.chat_conversations for update using (auth.uid() = user_id);
  end if;
end $$;

-- RLS for chat messages
alter table public.chat_messages enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can view messages in their conversations') then
    create policy "Users can view messages in their conversations" on public.chat_messages for select using (
      conversation_id in (select id from chat_conversations where user_id = auth.uid())
    );
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'chat_messages' and policyname = 'Users can create messages in their conversations') then
    create policy "Users can create messages in their conversations" on public.chat_messages for insert with check (
      conversation_id in (select id from chat_conversations where user_id = auth.uid())
    );
  end if;
end $$;

-- Function to automatically update conversation's updated_at
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update chat_conversations 
  set updated_at = now() 
  where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to update conversation timestamp on new message
drop trigger if exists update_conversation_on_message on chat_messages;
create trigger update_conversation_on_message
  after insert on chat_messages
  for each row execute function update_conversation_timestamp();

-- Function to auto-generate conversation title from first message
create or replace function generate_conversation_title()
returns trigger as $$
begin
  if NEW.role = 'user' and (
    select count(*) from chat_messages 
    where conversation_id = NEW.conversation_id and role = 'user'
  ) = 1 then
    update chat_conversations
    set title = substring(NEW.content from 1 for 50) || 
                case when length(NEW.content) > 50 then '...' else '' end
    where id = NEW.conversation_id and title is null;
  end if;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to generate title from first user message
drop trigger if exists generate_title_on_first_message on chat_messages;
create trigger generate_title_on_first_message
  after insert on chat_messages
  for each row execute function generate_conversation_title();
