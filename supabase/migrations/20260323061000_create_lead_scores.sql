-- Migration: Create lead_scores table for Lead Scoring Engine workflow
-- Created: 2026-03-23
-- Workflow: 07-lead-scoring-engine

CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID,
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  priority TEXT CHECK (priority IN ('hot', 'warm', 'cold')),
  reasoning TEXT,
  recommended_action TEXT CHECK (recommended_action IN ('immediate', 'within_24h', 'within_week')),
  scored_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by lead_id
CREATE INDEX IF NOT EXISTS idx_lead_scores_lead_id ON lead_scores(lead_id);

-- Index for priority filtering
CREATE INDEX IF NOT EXISTS idx_lead_scores_priority ON lead_scores(priority);

-- Index for score range queries
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON lead_scores(lead_score DESC);

-- Index for scored_at (for time-based reporting)
CREATE INDEX IF NOT EXISTS idx_lead_scores_scored_at ON lead_scores(scored_at DESC);

-- Add comment for documentation
COMMENT ON TABLE lead_scores IS 'Stores AI-generated lead scores from the Lead Scoring Engine workflow';
COMMENT ON COLUMN lead_scores.lead_score IS 'Score from 0-100 calculated by Groq AI based on lead quality';
COMMENT ON COLUMN lead_scores.priority IS 'Categorized priority: hot (>=70), warm (40-69), cold (<40)';
COMMENT ON COLUMN lead_scores.recommended_action IS 'Suggested response timeframe based on score';

-- Create view for hot leads dashboard
CREATE OR REPLACE VIEW hot_leads AS
SELECT 
  ls.*,
  CASE 
    WHEN ls.lead_score >= 80 THEN 'immediate'
    WHEN ls.lead_score >= 70 THEN 'within_24h'
    ELSE 'standard'
  END AS urgency_level
FROM lead_scores ls
WHERE ls.priority = 'hot'
ORDER BY ls.lead_score DESC, ls.scored_at DESC;

-- Grant access to authenticated users (adjust as needed for your RLS policies)
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users (customize per your auth setup)
CREATE POLICY lead_scores_all_authenticated ON lead_scores
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
