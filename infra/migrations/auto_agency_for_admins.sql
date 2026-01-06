-- Migration: Automatically assign Agency tier to admins
-- This ensures that any admin user automatically gets the Agency plan

-- Add trigger function to set plan to 'agency' when is_admin is set to true
create or replace function public.set_admin_to_agency()
returns trigger as $$
begin
  if new.is_admin = true and (old.is_admin is null or old.is_admin = false) then
    new.plan = 'agency';
  end if;
  return new;
end;
$$ language plpgsql;

-- Drop existing trigger if it exists (to avoid conflicts)
drop trigger if exists admin_to_agency_trigger on public.users;

-- Create trigger to apply the function
create trigger admin_to_agency_trigger
before insert or update on public.users
for each row
execute function public.set_admin_to_agency();

-- Update any existing admins who don't have agency plan
update public.users
set plan = 'agency'
where is_admin = true and plan != 'agency';