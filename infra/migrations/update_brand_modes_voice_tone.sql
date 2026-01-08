-- Add 'funny' to the voice_tone constraint in brand_modes table
ALTER TABLE public.brand_modes
  DROP CONSTRAINT IF EXISTS brand_modes_voice_tone_check;
ALTER TABLE public.brand_modes
  ADD CONSTRAINT brand_modes_voice_tone_check
  CHECK (voice_tone IN (
    'professional','casual','friendly','authoritative',
    'playful','empathetic','inspirational','funny'
  ));