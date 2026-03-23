-- Migration: Additional tables for new workflows
-- Created: 2026-03-23
-- Copy and paste this into Supabase SQL Editor
-- https://app.supabase.com/project/sehweutpfftnrcbqshsn/sql-editor

-- ============================================
-- EMAIL CLASSIFICATIONS (Workflow 08)
-- ============================================
CREATE TABLE IF NOT EXISTS email_classifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT,
  sender_email TEXT,
  sender_name TEXT,
  subject TEXT,
  body_preview TEXT,
  intent_classified TEXT CHECK (intent_classified IN ('inquiry', 'complaint', 'maintenance', 'application', 'general', 'spam')),
  urgency_level TEXT CHECK (urgency_level IN ('high', 'medium', 'low')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  extracted_entities JSONB,
  suggested_action TEXT,
  suggested_response TEXT,
  confidence DECIMAL(3,2),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'auto_replied', 'forwarded', 'resolved', 'spam')),
  forwarded_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  classified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_email_classifications_intent ON email_classifications(intent_classified);
CREATE INDEX idx_email_classifications_status ON email_classifications(status);
ALTER TABLE email_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY email_classifications_service_all ON email_classifications FOR ALL TO service_role USING (true);

-- ============================================
-- MAINTENANCE TICKETS (Workflow 09)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  request_source TEXT CHECK (request_source IN ('whatsapp', 'email', 'phone', 'app', 'portal')),
  issue_description TEXT NOT NULL,
  issue_category TEXT CHECK (issue_category IN ('plumbing', 'electrical', 'appliance', 'structural', 'cosmetic', 'hvac', 'security', 'other')),
  urgency_classified TEXT CHECK (urgency_classified IN ('emergency', 'urgent', 'routine', 'cosmetic')),
  ai_summary TEXT,
  recommended_contractor_type TEXT,
  estimated_severity INTEGER CHECK (estimated_severity >= 1 AND estimated_severity <= 5),
  ai_confidence DECIMAL(3,2),
  assigned_contractor_id UUID,
  contractor_notified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'ai_classified', 'assigned', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_classified_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_maintenance_tickets_tenant ON maintenance_tickets(tenant_id);
CREATE INDEX idx_maintenance_tickets_status ON maintenance_tickets(status);
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY maintenance_tickets_service_all ON maintenance_tickets FOR ALL TO service_role USING (true);

-- ============================================
-- RENT COLLECTION LOG (Workflow 13)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_collection_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  collection_stage INTEGER CHECK (collection_stage IN (7, 14, 21, 30)),
  days_overdue INTEGER,
  amount_owed DECIMAL(10,2),
  ai_message_sent TEXT,
  message_channel TEXT DEFAULT 'whatsapp',
  legal_notified BOOLEAN DEFAULT FALSE,
  tenant_responded BOOLEAN DEFAULT FALSE,
  payment_received BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rent_collection_tenant ON rent_collection_log(tenant_id);
CREATE INDEX idx_rent_collection_stage ON rent_collection_log(collection_stage);
ALTER TABLE rent_collection_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY rent_collection_log_service_all ON rent_collection_log FOR ALL TO service_role USING (true);

-- ============================================
-- SOCIAL MEDIA CONTENT (Workflow 20)
-- ============================================
CREATE TABLE IF NOT EXISTS social_media_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  content_type TEXT CHECK (content_type IN ('listing_new', 'price_drop', 'featured', 'testimonial', 'market_update')),
  platform TEXT CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  generated_caption TEXT,
  generated_hashtags TEXT[],
  suggested_images TEXT[],
  tone TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_media_property ON social_media_content(property_id);
CREATE INDEX idx_social_media_status ON social_media_content(status);
ALTER TABLE social_media_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY social_media_content_service_all ON social_media_content FOR ALL TO service_role USING (true);

-- Verify tables created
SELECT 'New tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('email_classifications', 'maintenance_tickets', 'rent_collection_log', 'social_media_content') ORDER BY tablename;
