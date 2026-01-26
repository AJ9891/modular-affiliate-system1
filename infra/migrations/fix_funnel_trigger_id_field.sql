-- Fix trigger function to handle tables with different primary key names
-- The funnels table uses 'funnel_id' as primary key, not 'id'

create or replace function log_team_activity()
returns trigger as $$
declare
  resource_id_value uuid;
begin
  -- Dynamically determine the primary key value based on table
  if TG_TABLE_NAME = 'funnels' then
    if TG_OP = 'DELETE' then
      resource_id_value := OLD.funnel_id;
    else
      resource_id_value := NEW.funnel_id;
    end if;
  else
    -- Default to 'id' field for other tables
    if TG_OP = 'DELETE' then
      resource_id_value := OLD.id;
    else
      resource_id_value := NEW.id;
    end if;
  end if;

  if TG_OP = 'INSERT' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(NEW.team_id, NEW.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_value,
      to_jsonb(NEW)
    );
  elsif TG_OP = 'UPDATE' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(NEW.team_id, NEW.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_value,
      jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    );
  elsif TG_OP = 'DELETE' then
    insert into team_activity_log (team_id, user_id, action, resource_type, resource_id, details)
    values (
      coalesce(OLD.team_id, OLD.user_id),
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      resource_id_value,
      to_jsonb(OLD)
    );
  end if;
  
  if TG_OP = 'DELETE' then
    return OLD;
  else
    return NEW;
  end if;
end;
$$ language plpgsql security definer;