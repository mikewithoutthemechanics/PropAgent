-- Rent Collection Follow-up Workflow - Supabase Schema
-- agent-loop - South African Real Estate Platform

-- Drop table if exists for clean setup
DROP TABLE IF EXISTS rent_collection_log;

-- Create rent collection log table
CREATE TABLE rent_collection_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  days_overdue INTEGER NOT NULL,
  amount_owed INTEGER NOT NULL,
  stage INTEGER NOT NULL CHECK (stage IN (7, 14, 21, 30)),
  message_sms TEXT,
  message_email TEXT,
  message_email_subject TEXT,
  message_whatsapp TEXT,
  tone TEXT CHECK (tone IN ('friendly', 'firm', 'serious', 'final')),
  escalation_recommended BOOLEAN DEFAULT false,
  payment_plan_offered BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_received BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  whatsapp_sent BOOLEAN DEFAULT false,
  legal_notified BOOLEAN DEFAULT false,
  groq_request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_rent_collection_tenant_id ON rent_collection_log(tenant_id);
CREATE INDEX idx_rent_collection_stage ON rent_collection_log(stage);
CREATE INDEX idx_rent_collection_sent_at ON rent_collection_log(sent_at);
CREATE INDEX idx_rent_collection_days_overdue ON rent_collection_log(days_overdue);
CREATE INDEX idx_rent_collection_escalation ON rent_collection_log(escalation_recommended) WHERE escalation_recommended = true;

-- Enable Row Level Security
ALTER TABLE rent_collection_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON rent_collection_log
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON rent_collection_log
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON rent_collection_log
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Add comments for documentation
COMMENT ON TABLE rent_collection_log IS 'Logs all rent collection communications including AI-generated messages and multi-channel delivery status';
COMMENT ON COLUMN rent_collection_log.stage IS 'Collection stage: 7, 14, 21, or 30 days overdue';
COMMENT ON COLUMN rent_collection_log.tone IS 'AI-generated message tone: friendly, firm, serious, or final';
COMMENT ON COLUMN rent_collection_log.escalation_recommended IS 'Flag for legal escalation when 30+ days overdue';
COMMENT ON COLUMN rent_collection_log.payment_plan_offered IS 'Whether payment plan option was included in message';

-- Create view for collection dashboard
CREATE OR REPLACE VIEW collection_dashboard AS
SELECT 
  tenant_id,
  COUNT(*) as total_communications,
  MAX(days_overdue) as max_days_overdue,
  MAX(stage) as current_stage,
  MAX(sent_at) as last_contact_date,
  BOOL_OR(escalation_recommended) as requires_escalation,
  BOOL_OR(response_received) as tenant_responded
FROM rent_collection_log
GROUP BY tenant_id;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON rent_collection_log TO authenticated;
GRANT SELECT ON collection_dashboard TO authenticated;
