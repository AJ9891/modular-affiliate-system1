-- BrandBrain: Brand Personality and Compliance System
-- Migration: add_brand_brain_tables.sql
-- This migration creates tables for managing brand voice, compliance rules, and AI generation constraints
-- Part of the Modular Affiliate System's AI & Automation Layer

-- Create brand_profiles table (linked to users and modules)
CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    niche_id UUID REFERENCES niches(id) ON DELETE SET NULL,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- PersonalityProfile
    brand_name TEXT NOT NULL,
    mission TEXT,
    brand_values JSONB DEFAULT '[]'::jsonb,
    target_audience TEXT,
    archetype TEXT,
    
    -- Voice & Tone
    voice_tone TEXT CHECK (voice_tone IN ('professional', 'casual', 'friendly', 'authoritative', 'playful', 'empathetic', 'inspirational')),
    voice_traits JSONB DEFAULT '[]'::jsonb,
    formality_level INTEGER CHECK (formality_level BETWEEN 1 AND 5),
    humor_level TEXT CHECK (humor_level IN ('none', 'subtle', 'moderate', 'heavy')),
    emoji_usage TEXT CHECK (emoji_usage IN ('never', 'rare', 'moderate', 'frequent')),
    
    -- Language & Structure
    language_complexity TEXT CHECK (language_complexity IN ('simple', 'moderate', 'advanced')),
    sentence_structure TEXT CHECK (sentence_structure IN ('short', 'varied', 'complex')),
    voice_preference TEXT CHECK (voice_preference IN ('active', 'mixed', 'passive')),
    jargon_policy TEXT CHECK (jargon_policy IN ('avoid', 'minimal', 'moderate', 'technical-ok')),
    
    -- AIPromptRules (for content generation)
    ai_system_instructions JSONB DEFAULT '{}'::jsonb,
    ai_content_generation JSONB DEFAULT '{}'::jsonb,
    ai_accuracy_rules JSONB DEFAULT '{}'::jsonb,
    ai_custom_templates JSONB DEFAULT '[]'::jsonb,
    
    -- UIBehaviorConstraints
    ui_visual JSONB DEFAULT '{}'::jsonb,
    ui_copy JSONB DEFAULT '{}'::jsonb,
    ui_interaction JSONB DEFAULT '{}'::jsonb,
    ui_accessibility JSONB DEFAULT '{}'::jsonb,
    
    -- SoundPolicy (voice/messaging guidelines)
    sound_voice_characteristics JSONB DEFAULT '{}'::jsonb,
    sound_word_choice JSONB DEFAULT '{}'::jsonb,
    sound_messaging JSONB DEFAULT '{}'::jsonb,
    sound_customer_communication JSONB DEFAULT '{}'::jsonb,
    
    -- ForbiddenClaims (compliance rules)
    forbidden_legal JSONB DEFAULT '{}'::jsonb,
    forbidden_regulatory JSONB DEFAULT '{}'::jsonb,
    forbidden_ethics JSONB DEFAULT '{}'::jsonb,
    forbidden_content_restrictions JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    version TEXT DEFAULT '1.0.0',
    last_reviewed_date TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id),
    notes TEXT
);

-- Create content_validations table (tracks AI-generated content compliance)
CREATE TABLE IF NOT EXISTS content_validations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    funnel_id UUID REFERENCES funnels(id) ON DELETE SET NULL,
    
    -- Content details
    content_type TEXT CHECK (content_type IN ('landing_page', 'email', 'ad_copy', 'social_post', 'sales_page')),
    content_text TEXT NOT NULL,
    validation_status TEXT CHECK (validation_status IN ('pending', 'approved', 'rejected', 'flagged')),
    compliance_score INTEGER CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Violations found
    violations JSONB DEFAULT '[]'::jsonb,
    feedback TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    validated_by UUID REFERENCES auth.users(id)
);

-- Create brand_ai_generations table (logs all AI-generated content from this brand)
CREATE TABLE IF NOT EXISTS brand_ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_profile_id UUID NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Generation context
    generation_type TEXT CHECK (generation_type IN ('funnel', 'email', 'ad_copy', 'sales_page', 'product_page')),
    prompt TEXT,
    generated_content TEXT,
    
    -- Quality metrics
    brand_alignment_score INTEGER CHECK (brand_alignment_score >= 0 AND brand_alignment_score <= 100),
    is_approved BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_brand_profiles_user_active ON brand_profiles(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_brand_profiles_user ON brand_profiles(user_id);
CREATE INDEX idx_brand_profiles_niche ON brand_profiles(niche_id);

CREATE INDEX idx_content_validations_brand ON content_validations(brand_profile_id);
CREATE INDEX idx_content_validations_user ON content_validations(user_id);
CREATE INDEX idx_content_validations_status ON content_validations(validation_status);
CREATE INDEX idx_content_validations_funnel ON content_validations(funnel_id);

CREATE INDEX idx_brand_ai_generations_brand ON brand_ai_generations(brand_profile_id);
CREATE INDEX idx_brand_ai_generations_user ON brand_ai_generations(user_id);
CREATE INDEX idx_brand_ai_generations_type ON brand_ai_generations(generation_type);

-- Enable Row Level Security
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_ai_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can access own brand profiles"
    ON brand_profiles
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can access own content validations"
    ON content_validations
    FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can access own brand AI generations"
    ON brand_ai_generations
    FOR ALL
    USING (auth.uid() = user_id);
