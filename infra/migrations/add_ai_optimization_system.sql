-- AI Optimization System Tables
-- Create tables for tracking AI optimization suggestions, A/B tests, and optimization history

-- Optimization log table to track all AI optimizations
CREATE TABLE optimization_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    block_id VARCHAR(255) NOT NULL,
    optimization_type VARCHAR(50) NOT NULL, -- 'content', 'style', 'placement', 'removal'
    field_changed VARCHAR(100) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    reason TEXT NOT NULL,
    expected_lift DECIMAL(5,2) DEFAULT 0, -- Expected percentage improvement
    confidence DECIMAL(3,2) DEFAULT 0, -- Confidence score 0-1
    status VARCHAR(20) DEFAULT 'applied', -- 'applied', 'dismissed', 'reverted'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B tests table for managing test variations
CREATE TABLE ab_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    block_id VARCHAR(255) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL, -- 'headline', 'cta', 'copy', 'style'
    variations JSONB NOT NULL, -- Array of variation objects
    traffic_split JSONB NOT NULL, -- Traffic allocation per variation
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'completed'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    winner_variation_id VARCHAR(255),
    significance_reached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B test results table for tracking performance
CREATE TABLE ab_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ab_test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
    variation_id VARCHAR(255) NOT NULL,
    metric_name VARCHAR(50) NOT NULL, -- 'views', 'clicks', 'conversions'
    metric_value INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    confidence_interval JSONB, -- Statistical confidence data
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimization suggestions cache (temporary storage for UI)
CREATE TABLE optimization_suggestions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
    suggestions JSONB NOT NULL, -- Array of suggestion objects
    analysis_date TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_optimization_log_funnel_id ON optimization_log(funnel_id);
CREATE INDEX idx_optimization_log_created_at ON optimization_log(created_at DESC);
CREATE INDEX idx_ab_tests_funnel_id ON ab_tests(funnel_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_test_results_test_id ON ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_date ON ab_test_results(date DESC);
CREATE INDEX idx_optimization_suggestions_funnel_id ON optimization_suggestions(funnel_id);
CREATE INDEX idx_optimization_suggestions_expires_at ON optimization_suggestions(expires_at);

-- RLS Policies
ALTER TABLE optimization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_suggestions ENABLE ROW LEVEL SECURITY;

-- Optimization log policies
CREATE POLICY "optimization_log_select" ON optimization_log FOR SELECT USING (
    funnel_id IN (
        SELECT f.id FROM funnels f WHERE f.user_id = auth.uid()
    )
);

CREATE POLICY "optimization_log_insert" ON optimization_log FOR INSERT WITH CHECK (
    funnel_id IN (
        SELECT f.id FROM funnels f WHERE f.user_id = auth.uid()
    )
);

-- A/B tests policies
CREATE POLICY "ab_tests_all" ON ab_tests FOR ALL USING (user_id = auth.uid());

-- A/B test results policies
CREATE POLICY "ab_test_results_select" ON ab_test_results FOR SELECT USING (
    ab_test_id IN (
        SELECT id FROM ab_tests WHERE user_id = auth.uid()
    )
);

CREATE POLICY "ab_test_results_insert" ON ab_test_results FOR INSERT WITH CHECK (
    ab_test_id IN (
        SELECT id FROM ab_tests WHERE user_id = auth.uid()
    )
);

-- Optimization suggestions policies
CREATE POLICY "optimization_suggestions_all" ON optimization_suggestions FOR ALL USING (
    funnel_id IN (
        SELECT f.id FROM funnels f WHERE f.user_id = auth.uid()
    )
);

-- Function to clean up expired suggestions
CREATE OR REPLACE FUNCTION cleanup_expired_suggestions()
RETURNS void AS $$
BEGIN
    DELETE FROM optimization_suggestions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate A/B test significance
CREATE OR REPLACE FUNCTION calculate_ab_test_significance(test_id UUID)
RETURNS TABLE (
    variation_id VARCHAR(255),
    conversion_rate DECIMAL(5,2),
    is_significant BOOLEAN,
    confidence_level DECIMAL(5,2)
) AS $$
BEGIN
    -- Simplified significance calculation
    -- In production, you'd want more sophisticated statistical analysis
    RETURN QUERY
    SELECT 
        r.variation_id,
        r.conversion_rate,
        CASE WHEN r.conversion_rate > 0 AND r.metric_value > 100 THEN TRUE ELSE FALSE END as is_significant,
        CASE WHEN r.metric_value > 100 THEN 95.0 ELSE 0.0 END as confidence_level
    FROM ab_test_results r
    WHERE r.ab_test_id = test_id
    GROUP BY r.variation_id, r.conversion_rate, r.metric_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update ab_tests updated_at
CREATE OR REPLACE FUNCTION update_ab_tests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ab_tests_updated_at_trigger
    BEFORE UPDATE ON ab_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_ab_tests_updated_at();

COMMENT ON TABLE optimization_log IS 'Tracks all AI-powered optimizations applied to funnels';
COMMENT ON TABLE ab_tests IS 'Manages A/B test experiments with AI-generated variations';
COMMENT ON TABLE ab_test_results IS 'Stores performance metrics for A/B test variations';
COMMENT ON TABLE optimization_suggestions IS 'Temporary cache for AI optimization suggestions';

COMMENT ON COLUMN optimization_log.expected_lift IS 'Expected percentage improvement from this optimization';
COMMENT ON COLUMN optimization_log.confidence IS 'AI confidence score for this optimization (0-1)';
COMMENT ON COLUMN ab_tests.variations IS 'JSON array containing all test variations with their configurations';
COMMENT ON COLUMN ab_tests.traffic_split IS 'JSON object defining traffic allocation percentages';