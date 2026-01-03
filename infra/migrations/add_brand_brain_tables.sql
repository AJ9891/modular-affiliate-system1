-- BrandBrain: Brand Personality and Compliance System
-- Migration: add_brand_brain_tables.sql

-- Create brand_profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- PersonalityProfile
    brand_name TEXT NOT NULL,
    mission TEXT,
    values JSONB DEFAULT '[]'::jsonb,
    target_audience TEXT,
    archetype TEXT,
    
    voice_tone TEXT CHECK (voice_tone IN ('professional', 'casual', 'friendly', 'authoritative', 'playful', 'empathetic', 'inspirational')),
    voice_traits JSONB DEFAULT '[]'::jsonb,
    formality_level INTEGER CHECK (formality_level BETWEEN 1 AND 5),
    humor_level TEXT CHECK (humor_level IN ('none', 'subtle', 'moderate', 'heavy')),
    emoji_usage TEXT CHECK (emoji_usage IN ('never', 'rare', 'moderate', 'frequent')),
    
    language_complexity TEXT CHECK (language_complexity IN ('simple', 'moderate', 'advanced')),
    sentence_structure TEXT CHECK (sentence_structure IN ('short', 'varied', 'complex')),
    voice_preference TEXT CHECK (voice_preference IN ('active', 'mixed', 'passive')),
    jargon_policy TEXT CHECK (jargon_policy IN ('avoid', 'minimal', 'moderate', 'technical-ok')),
    
    -- AIPromptRules
    ai_system_instructions JSONB DEFAULT '{}'::jsonb,
    ai_content_generation JSONB DEFAULT '{}'::jsonb,
    ai_accuracy_rules JSONB DEFAULT '{}'::jsonb,
    ai_custom_templates JSONB DEFAULT '[]'::jsonb,
    
    -- UIBehaviorConstraints
    ui_visual JSONB DEFAULT '{}'::jsonb,
    ui_copy JSONB DEFAULT '{}'::jsonb,
    ui_interaction JSONB DEFAULT '{}'::jsonb,
    ui_accessibility JSONB DEFAULT '{}'::jsonb,
    
    -- SoundPolicy
    sound_voice_characteristics JSONB DEFAULT '{}'::jsonb,
    sound_word_choice JSONB DEFAULT '{}'::jsonb,
    sound_messaging JSONB DEFAULT '{}'::jsonb,
    sound_customer_communication JSONB DEFAULT '{}'::jsonb,
    
    -- ForbiddenClaims
    forbidden_legal JSONB DEFAULT '{}'::jsonb,
    forbidden_regulatory JSONB DEFAULT '{}'::jsonb,
    forbidden_ethics JSONB DEFAULT '{}'::jsonb,
    forbidden_content_restrictions JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    version TEXT DEFAULT '1.0.0',
    last_reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    
    CONSTRAINT unique_active_profile_per_user UNIQUE NULLS NOT DISTINCT (user_id, is_active)
);

-- Create index for active profiles
CREATE INDEX idx_brand_profiles_user_active ON brand_profiles(user_id, is_active) WHERE is_active = true;

-- Create index for lookups
CREATE INDEX idx_brand_profiles_user ON brand_profiles(user_id);

-- Create content_validations table (to track validation history)
CREATE TABLE IF NOT EXISTS content_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content details
    content_type TEXT, -- 'landing-page', 'email', 'ad-copy', etc.
    content_text TEXT NOT NULL,
    content_length INTEGER,
    
    -- Validation results
    violations JSONB DEFAULT '[]'::jsonb,
    score INTEGER CHECK (score BETWEEN 0 AND 100),
    approved BOOLEAN DEFAULT false,
    
    -- Metadata
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Optional reference to what was validated
    funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
    page_id UUID,
    
    CONSTRAINT content_validations_score_check CHECK (score >= 0 AND score <= 100)
);

-- Create indexes for content_validations
CREATE INDEX idx_content_validations_brand ON content_validations(brand_profile_id);
CREATE INDEX idx_content_validations_user ON content_validations(user_id);
CREATE INDEX idx_content_validations_approved ON content_validations(approved);
CREATE INDEX idx_content_validations_date ON content_validations(validated_at);

-- RLS Policies for brand_profiles
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand profiles
CREATE POLICY "Users can view own brand profiles"
    ON brand_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own brand profiles
CREATE POLICY "Users can create own brand profiles"
    ON brand_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand profiles
CREATE POLICY "Users can update own brand profiles"
    ON brand_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own brand profiles
CREATE POLICY "Users can delete own brand profiles"
    ON brand_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for content_validations
ALTER TABLE content_validations ENABLE ROW LEVEL SECURITY;

-- Users can view their own content validations
CREATE POLICY "Users can view own content validations"
    ON content_validations FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own content validations
CREATE POLICY "Users can create own content validations"
    ON content_validations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_brand_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER brand_profiles_updated_at
    BEFORE UPDATE ON brand_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_brand_profiles_updated_at();

-- Function to ensure only one active profile per user
CREATE OR REPLACE FUNCTION ensure_single_active_brand_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this profile to active, deactivate all others for this user
    IF NEW.is_active = true THEN
        UPDATE brand_profiles
        SET is_active = false
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active profile
CREATE TRIGGER ensure_single_active_brand_profile_trigger
    BEFORE INSERT OR UPDATE ON brand_profiles
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION ensure_single_active_brand_profile();

-- Add helpful comments
COMMENT ON TABLE brand_profiles IS 'Stores brand personality profiles including voice, tone, compliance rules, and UI constraints';
COMMENT ON TABLE content_validations IS 'Tracks validation results for content against brand guidelines';
COMMENT ON COLUMN brand_profiles.is_active IS 'Only one profile can be active per user at a time';
COMMENT ON COLUMN brand_profiles.ai_system_instructions IS 'JSON containing mustInclude, mustAvoid, and responseStructure';
COMMENT ON COLUMN content_validations.violations IS 'Array of validation violations with type, severity, message, and suggestion';
COMMENT ON COLUMN content_validations.score IS 'Brand alignment score from 0-100';
