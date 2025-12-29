-- Migration: Add brand_modes table
-- Description: Creates brand_modes table for managing different brand themes and personalities

-- Brand Modes Table
CREATE TABLE IF NOT EXISTS public.brand_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add comment
COMMENT ON TABLE public.brand_modes IS 'Stores brand mode configurations for different brand personalities and themes';

-- RLS Policies
ALTER TABLE public.brand_modes ENABLE ROW LEVEL SECURITY;

-- Allow all users to read brand modes
CREATE POLICY "Brand modes are viewable by everyone"
  ON public.brand_modes
  FOR SELECT
  USING (true);

-- Only admins can insert/update/delete brand modes
CREATE POLICY "Only admins can manage brand modes"
  ON public.brand_modes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Insert default brand modes
INSERT INTO public.brand_modes (id, name, description, is_system) VALUES
  ('rocket', 'Rocket', 'High-energy launch-themed brand with bold colors and explosive energy', true),
  ('sleek', 'Sleek', 'Modern minimalist design with clean lines and sophisticated aesthetics', true),
  ('playful', 'Playful', 'Fun and approachable brand with vibrant colors and friendly tone', true),
  ('corporate', 'Corporate', 'Professional enterprise-focused brand with trust and authority', true)
ON CONFLICT (id) DO NOTHING;
