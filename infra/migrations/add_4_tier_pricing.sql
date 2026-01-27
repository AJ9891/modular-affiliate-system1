-- 4-Tier Pricing Structure Migration
-- Implements Free → Starter → Pro → Agency tiers

-- Update users table with new plan structure and limits
ALTER TABLE users 
DROP COLUMN IF EXISTS max_launchpads,
ADD COLUMN plan_tier VARCHAR(20) DEFAULT 'free',
ADD COLUMN max_funnels INTEGER DEFAULT 1,
ADD COLUMN max_leads_per_month INTEGER DEFAULT 50,
ADD COLUMN max_ai_generations_per_month INTEGER DEFAULT 25,
ADD COLUMN max_email_sequences INTEGER DEFAULT 0,
ADD COLUMN analytics_retention_days INTEGER DEFAULT 7,
ADD COLUMN can_use_custom_domains BOOLEAN DEFAULT FALSE,
ADD COLUMN can_ab_test BOOLEAN DEFAULT FALSE,
ADD COLUMN can_auto_optimize BOOLEAN DEFAULT FALSE,
ADD COLUMN can_white_label BOOLEAN DEFAULT FALSE,
ADD COLUMN max_team_members INTEGER DEFAULT 1,
ADD COLUMN ai_generations_used_this_month INTEGER DEFAULT 0,
ADD COLUMN ai_generation_reset_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN leads_captured_this_month INTEGER DEFAULT 0,
ADD COLUMN leads_reset_date DATE DEFAULT CURRENT_DATE;

-- Create plan_features table for centralized plan management
CREATE TABLE plan_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_tier VARCHAR(20) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    feature_value TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(plan_tier, feature_name)
);

-- Insert plan features for all tiers
INSERT INTO plan_features (plan_tier, feature_name, feature_value, is_enabled) VALUES
-- FREE TIER
('free', 'max_funnels', '1', TRUE),
('free', 'max_blocks_per_funnel', '3', TRUE),
('free', 'max_leads_per_month', '50', TRUE),
('free', 'max_ai_generations_per_month', '25', TRUE),
('free', 'analytics_retention_days', '7', TRUE),
('free', 'can_use_custom_domains', 'false', FALSE),
('free', 'can_ab_test', 'false', FALSE),
('free', 'can_auto_optimize', 'false', FALSE),
('free', 'available_templates', 'basic', TRUE),
('free', 'max_email_sequences', '0', TRUE),
('free', 'support_level', 'community', TRUE),

-- STARTER TIER ($29/month)
('starter', 'max_funnels', '3', TRUE),
('starter', 'max_blocks_per_funnel', 'unlimited', TRUE),
('starter', 'max_leads_per_month', '500', TRUE),
('starter', 'max_ai_generations_per_month', '200', TRUE),
('starter', 'analytics_retention_days', '30', TRUE),
('starter', 'can_use_custom_domains', 'false', FALSE),
('starter', 'can_ab_test', 'false', FALSE),
('starter', 'can_auto_optimize', 'false', FALSE),
('starter', 'available_templates', 'professional', TRUE),
('starter', 'max_email_sequences', '5', TRUE),
('starter', 'support_level', 'email', TRUE),

-- PRO TIER ($99/month)
('pro', 'max_funnels', 'unlimited', TRUE),
('pro', 'max_blocks_per_funnel', 'unlimited', TRUE),
('pro', 'max_leads_per_month', 'unlimited', TRUE),
('pro', 'max_ai_generations_per_month', 'unlimited', TRUE),
('pro', 'analytics_retention_days', '365', TRUE),
('pro', 'can_use_custom_domains', 'true', TRUE),
('pro', 'can_ab_test', 'true', TRUE),
('pro', 'can_auto_optimize', 'true', TRUE),
('pro', 'available_templates', 'premium', TRUE),
('pro', 'max_email_sequences', 'unlimited', TRUE),
('pro', 'support_level', 'email', TRUE),

-- AGENCY TIER ($299/month)
('agency', 'max_funnels', 'unlimited', TRUE),
('agency', 'max_blocks_per_funnel', 'unlimited', TRUE),
('agency', 'max_leads_per_month', 'unlimited', TRUE),
('agency', 'max_ai_generations_per_month', 'unlimited', TRUE),
('agency', 'analytics_retention_days', '365', TRUE),
('agency', 'can_use_custom_domains', 'true', TRUE),
('agency', 'can_ab_test', 'true', TRUE),
('agency', 'can_auto_optimize', 'true', TRUE),
('agency', 'available_templates', 'premium', TRUE),
('agency', 'max_email_sequences', 'unlimited', TRUE),
('agency', 'max_team_members', '10', TRUE),
('agency', 'can_white_label', 'true', TRUE),
('agency', 'can_manage_clients', 'true', TRUE),
('agency', 'can_resell', 'true', TRUE),
('agency', 'support_level', 'email', TRUE);

-- Create usage tracking table
CREATE TABLE user_usage_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL, -- 'ai_generation', 'lead_capture', 'funnel_creation'
    usage_count INTEGER DEFAULT 1,
    reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, usage_type, reset_date)
);

-- Function to check if user can perform action based on plan limits
CREATE OR REPLACE FUNCTION check_plan_limit(
    user_id_param UUID,
    feature_name_param VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    feature_limit TEXT;
    current_usage INTEGER;
BEGIN
    -- Get user's current plan
    SELECT plan_tier INTO user_plan FROM users WHERE id = user_id_param;
    
    -- Get the limit for this feature
    SELECT feature_value INTO feature_limit 
    FROM plan_features 
    WHERE plan_tier = user_plan AND feature_name = feature_name_param;
    
    -- If unlimited, always return true
    IF feature_limit = 'unlimited' THEN
        RETURN TRUE;
    END IF;
    
    -- For monthly limits, check current usage
    IF feature_name_param LIKE '%_per_month' THEN
        -- Get current month's usage
        SELECT COALESCE(usage_count, 0) INTO current_usage
        FROM user_usage_tracking
        WHERE user_id = user_id_param 
        AND usage_type = REPLACE(feature_name_param, '_per_month', '')
        AND reset_date = CURRENT_DATE;
        
        -- Check if under limit
        RETURN current_usage < feature_limit::INTEGER;
    END IF;
    
    -- For other limits, return true for now (implement specific checks as needed)
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
    user_id_param UUID,
    usage_type_param VARCHAR(50)
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_usage_tracking (user_id, usage_type, usage_count, reset_date)
    VALUES (user_id_param, usage_type_param, 1, CURRENT_DATE)
    ON CONFLICT (user_id, usage_type, reset_date)
    DO UPDATE SET usage_count = user_usage_tracking.usage_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly counters (run daily via cron)
CREATE OR REPLACE FUNCTION reset_monthly_usage() RETURNS VOID AS $$
BEGIN
    -- Reset AI generation counters on first of month
    IF EXTRACT(DAY FROM CURRENT_DATE) = 1 THEN
        DELETE FROM user_usage_tracking 
        WHERE usage_type = 'ai_generation' 
        AND reset_date < CURRENT_DATE;
        
        DELETE FROM user_usage_tracking 
        WHERE usage_type = 'lead_capture' 
        AND reset_date < CURRENT_DATE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to free tier with new structure
UPDATE users SET 
    plan_tier = CASE 
        WHEN plan = 'agency' THEN 'agency'
        WHEN plan = 'pro' THEN 'pro' 
        WHEN plan = 'starter' THEN 'starter'
        ELSE 'free'
    END,
    max_funnels = CASE plan_tier
        WHEN 'free' THEN 1
        WHEN 'starter' THEN 3
        ELSE 999999
    END,
    max_leads_per_month = CASE plan_tier
        WHEN 'free' THEN 50
        WHEN 'starter' THEN 500
        ELSE 999999
    END,
    max_ai_generations_per_month = CASE plan_tier
        WHEN 'free' THEN 25
        WHEN 'starter' THEN 200
        ELSE 999999
    END,
    can_use_custom_domains = CASE plan_tier
        WHEN 'pro' THEN TRUE
        WHEN 'agency' THEN TRUE
        ELSE FALSE
    END,
    can_ab_test = CASE plan_tier
        WHEN 'pro' THEN TRUE
        WHEN 'agency' THEN TRUE
        ELSE FALSE
    END,
    can_auto_optimize = CASE plan_tier
        WHEN 'pro' THEN TRUE
        WHEN 'agency' THEN TRUE
        ELSE FALSE
    END,
    can_white_label = CASE plan_tier
        WHEN 'agency' THEN TRUE
        ELSE FALSE
    END,
    max_team_members = CASE plan_tier
        WHEN 'agency' THEN 10
        ELSE 1
    END;

-- Add indexes for performance
CREATE INDEX idx_plan_features_tier ON plan_features(plan_tier);
CREATE INDEX idx_user_usage_tracking_user_type ON user_usage_tracking(user_id, usage_type);
CREATE INDEX idx_user_usage_tracking_reset_date ON user_usage_tracking(reset_date);

-- RLS Policies
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Plan features are read-only for all authenticated users
CREATE POLICY "plan_features_select" ON plan_features FOR SELECT TO authenticated USING (true);

-- Users can only see their own usage tracking
CREATE POLICY "user_usage_tracking_all" ON user_usage_tracking FOR ALL USING (
    user_id = auth.uid()
);

COMMENT ON TABLE plan_features IS 'Centralized plan feature definitions and limits';
COMMENT ON TABLE user_usage_tracking IS 'Track monthly usage against plan limits';
COMMENT ON FUNCTION check_plan_limit IS 'Check if user can perform action based on their plan limits';
COMMENT ON FUNCTION increment_usage IS 'Increment usage counter for plan limit tracking';