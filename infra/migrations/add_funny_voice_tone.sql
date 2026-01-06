-- Add 'funny' to the voice_tone constraint in brand_profiles table
ALTER TABLE public.brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_voice_tone_check;
ALTER TABLE public.brand_profiles ADD CONSTRAINT brand_profiles_voice_tone_check 
CHECK (voice_tone IN ('professional', 'casual', 'friendly', 'authoritative', 'playful', 'empathetic', 'inspirational', 'funny'));