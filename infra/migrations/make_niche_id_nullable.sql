-- Make niche_id nullable in funnels table
ALTER TABLE public.funnels ALTER COLUMN niche_id DROP NOT NULL;