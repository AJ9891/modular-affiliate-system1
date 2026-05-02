-- Migrate legacy sendshark campaign identifiers to provider-agnostic columns.
-- Keep legacy columns in place for backward compatibility.

alter table public.email_campaigns
  add column if not exists provider_campaign_id text;

update public.email_campaigns
set provider_campaign_id = sendshark_id
where provider_campaign_id is null
  and sendshark_id is not null;

create unique index if not exists idx_email_campaigns_provider_campaign_id
  on public.email_campaigns(provider_campaign_id)
  where provider_campaign_id is not null;
