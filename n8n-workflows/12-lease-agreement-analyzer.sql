-- ============================================
-- Lease Agreement Analyzer - Supabase Schema
-- Workflow #12: Agent Loop Real Estate Platform
-- ============================================

-- Main table for lease analysis results
CREATE TABLE IF NOT EXISTS lease_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lease_id UUID,
  property_id UUID,
  parties JSONB DEFAULT '{}',
  property JSONB DEFAULT '{}',
  financial JSONB DEFAULT '{}',
  duration JSONB DEFAULT '{}',
  clauses JSONB DEFAULT '{}',
  risk_assessment JSONB DEFAULT '{}',
  compliance JSONB DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups by lease_id
CREATE INDEX IF NOT EXISTS idx_lease_analysis_lease_id ON lease_analysis(lease_id);
CREATE INDEX IF NOT EXISTS idx_lease_analysis_property_id ON lease_analysis(property_id);
CREATE INDEX IF NOT EXISTS idx_lease_analysis_analyzed_at ON lease_analysis(analyzed_at DESC);

-- GIN indexes for JSONB columns (for querying nested data)
CREATE INDEX IF NOT EXISTS idx_lease_analysis_parties ON lease_analysis USING GIN (parties);
CREATE INDEX IF NOT EXISTS idx_lease_analysis_risk ON lease_analysis USING GIN (risk_assessment);

-- Table for high-risk alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type VARCHAR(50) NOT NULL,
  lease_id UUID,
  property_id UUID,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT,
  details JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'dismissed')),
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- Table for notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  lease_id UUID,
  title VARCHAR(255),
  message TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies (Row Level Security)
ALTER TABLE lease_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own lease analyses
CREATE POLICY lease_analysis_select_policy ON lease_analysis
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM leases WHERE id = lease_analysis.lease_id
    ) OR auth.uid() IN (
      SELECT user_id FROM properties WHERE id = lease_analysis.property_id
    )
  );

-- Policy: Service role can insert/update all
CREATE POLICY lease_analysis_service_policy ON lease_analysis
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Alerts accessible to assigned users and admins
CREATE POLICY alerts_select_policy ON alerts
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    auth.role() = 'service_role'
  );

-- Policy: Notifications for the user
CREATE POLICY notifications_select_policy ON notifications
  FOR SELECT USING (
    lease_id IN (SELECT id FROM leases WHERE user_id = auth.uid())
  );

-- ============================================
-- Sample Queries
-- ============================================

-- Get all high-risk leases
SELECT 
  la.id,
  la.lease_id,
  la.parties->>'landlord' as landlord,
  la.parties->>'tenant' as tenant,
  la.property->>'address' as property_address,
  la.risk_assessment->>'level' as risk_level,
  la.analyzed_at
FROM lease_analysis la
WHERE la.risk_assessment->>'level' = 'high'
ORDER BY la.analyzed_at DESC;

-- Get compliance statistics
SELECT 
  COUNT(*) as total_analyzed,
  SUM(CASE WHEN compliance->>'fica_referenced' = 'true' THEN 1 ELSE 0 END) as fica_compliant,
  SUM(CASE WHEN compliance->>'popia_referenced' = 'true' THEN 1 ELSE 0 END) as popia_compliant,
  SUM(CASE WHEN compliance->>'consumer_protection_act' = 'true' THEN 1 ELSE 0 END) as cpa_compliant
FROM lease_analysis;

-- Get average rent by property type
SELECT 
  property->>'type' as property_type,
  COUNT(*) as count,
  AVG((financial->>'monthly_rent')::numeric) as avg_rent,
  AVG((financial->>'deposit')::numeric) as avg_deposit
FROM lease_analysis
GROUP BY property->>'type';

-- Get leases with missing standard clauses
SELECT 
  la.id,
  la.property->>'address' as address,
  jsonb_array_elements_text(la.risk_assessment->'missing_clauses') as missing_clause
FROM lease_analysis la
WHERE jsonb_array_length(la.risk_assessment->'missing_clauses') > 0;
