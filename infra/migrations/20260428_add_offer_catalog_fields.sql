-- Add richer offer catalog fields used by Launchpad and Offers workspace.

alter table public.offers
  add column if not exists niche_label text,
  add column if not exists commission_type text check (commission_type in ('percent', 'flat')) default 'percent',
  add column if not exists commission_value numeric(12,2),
  add column if not exists commission_currency text default 'USD';

update public.offers
set
  commission_type = coalesce(commission_type, 'percent'),
  commission_value = coalesce(commission_value, commission_rate),
  commission_currency = coalesce(commission_currency, 'USD')
where commission_type is null
   or commission_value is null
   or commission_currency is null;

create index if not exists idx_offers_niche_label on public.offers(niche_label);
create index if not exists idx_offers_commission_type on public.offers(commission_type);
