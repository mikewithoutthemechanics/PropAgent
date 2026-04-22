-- Migration: Additional tables for new workflows
-- Created: 2026-03-23
-- Workflows: 08, 09, 13, 20
-- Updated: 2026-03-24 - Added listing_syndication table for agent-loop Listing Syndication

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
  
  -- AI Classification
  intent_classified TEXT CHECK (intent_classified IN ('inquiry', 'complaint', 'maintenance', 'application', 'general', 'spam')),
  urgency_level TEXT CHECK (urgency_level IN ('high', 'medium', 'low')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  extracted_entities JSONB, -- e.g., {"property_address": "...", "dates": [...]}
  suggested_action TEXT,
  suggested_response TEXT,
  confidence DECIMAL(3,2),
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'auto_replied', 'forwarded', 'resolved', 'spam')),
  forwarded_to TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  classified_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE email_classifications IS 'AI-classified emails from Email Intent Classifier workflow (08)';

CREATE INDEX idx_email_classifications_intent ON email_classifications(intent_classified);
CREATE INDEX idx_email_classifications_status ON email_classifications(status);
CREATE INDEX idx_email_classifications_sender ON email_classifications(sender_email);

-- ============================================
-- MAINTENANCE TICKETS (Workflow 09)
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Request info
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  request_source TEXT CHECK (request_source IN ('whatsapp', 'email', 'phone', 'app', 'portal')),
  
  -- Issue details
  issue_description TEXT NOT NULL,
  issue_category TEXT CHECK (issue_category IN ('plumbing', 'electrical', 'appliance', 'structural', 'cosmetic', 'hvac', 'security', 'other')),
  urgency_classified TEXT CHECK (urgency_classified IN ('emergency', 'urgent', 'routine', 'cosmetic')),
  
  -- AI Analysis
  ai_summary TEXT,
  recommended_contractor_type TEXT,
  estimated_severity INTEGER CHECK (estimated_severity >= 1 AND estimated_severity <= 5),
  ai_confidence DECIMAL(3,2),
  
  -- Assignment
  assigned_contractor_id UUID,
  contractor_notified BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'ai_classified', 'assigned', 'in_progress', 'completed', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_classified_at TIMESTAMP WITH TIME ZONE,
  contractor_assigned_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE maintenance_tickets IS 'Maintenance requests processed by AI ticket router (workflow 09)';

CREATE INDEX idx_maintenance_tickets_tenant ON maintenance_tickets(tenant_id);
CREATE INDEX idx_maintenance_tickets_property ON maintenance_tickets(property_id);
CREATE INDEX idx_maintenance_tickets_status ON maintenance_tickets(status);
CREATE INDEX idx_maintenance_tickets_category ON maintenance_tickets(issue_category);

-- ============================================
-- RENT COLLECTION LOG (Workflow 13)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_collection_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  property_id UUID REFERENCES properties(id),
  
  -- Collection details
  collection_stage INTEGER CHECK (collection_stage IN (7, 14, 21, 30)),
  days_overdue INTEGER,
  amount_owed DECIMAL(10,2),
  
  -- AI Message
  ai_message_sent TEXT,
  message_channel TEXT DEFAULT 'whatsapp',
  
  -- Escalation tracking
  legal_notified BOOLEAN DEFAULT FALSE,
  legal_notice_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  tenant_responded BOOLEAN DEFAULT FALSE,
  tenant_response TEXT,
  payment_received BOOLEAN DEFAULT FALSE,
  payment_amount DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE rent_collection_log IS 'Rent collection follow-up tracking (workflow 13)';

CREATE INDEX idx_rent_collection_tenant ON rent_collection_log(tenant_id);
CREATE INDEX idx_rent_collection_stage ON rent_collection_log(collection_stage);
CREATE INDEX idx_rent_collection_created ON rent_collection_log(created_at);

-- ============================================
-- SOCIAL MEDIA CONTENT (Workflow 20)
-- ============================================
CREATE TABLE IF NOT EXISTS social_media_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  
  -- Content generation
  content_type TEXT CHECK (content_type IN ('listing_new', 'price_drop', 'featured', 'testimonial', 'market_update')),
  platform TEXT CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  
  -- AI Generated content
  generated_caption TEXT,
  generated_hashtags TEXT[],
  suggested_images TEXT[],
  tone TEXT CHECK (tone IN ('professional', 'casual', 'luxury', 'friendly')),
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  timezone TEXT DEFAULT 'Africa/Johannesburg',
  
  -- Posting status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'posted', 'failed', 'cancelled')),
  posted_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT,
  
  -- Engagement (updated after posting)
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE social_media_content IS 'AI-generated social media posts (workflow 20)';

CREATE INDEX idx_social_media_property ON social_media_content(property_id);
CREATE INDEX idx_social_media_status ON social_media_content(status);
CREATE INDEX idx_social_media_scheduled ON social_media_content(scheduled_for);

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE email_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_collection_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_content ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY email_classifications_service_all ON email_classifications FOR ALL TO service_role USING (true);
CREATE POLICY maintenance_tickets_service_all ON maintenance_tickets FOR ALL TO service_role USING (true);
CREATE POLICY rent_collection_log_service_all ON rent_collection_log FOR ALL TO service_role USING (true);
CREATE POLICY social_media_content_service_all ON social_media_content FOR ALL TO service_role USING (true);

-- ============================================
-- LISTING SYNDICATION (Listing Syndication Workflow)
-- ============================================
CREATE TABLE IF NOT EXISTS listing_syndication (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Property and Portal
  property_id UUID NOT NULL,
  portal_name TEXT NOT NULL CHECK (portal_name IN ('property24', 'private_property', 'gumtree')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'syndicated', 'failed', 'pending_retry')),
  syndicated_at TIMESTAMP WITH TIME ZONE,
  external_id TEXT,
  error_message TEXT,
  
  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_retry_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE listing_syndication IS 'Tracks property listing syndication status to external portals';

CREATE INDEX idx_listing_syndication_property ON listing_syndication(property_id);
CREATE INDEX idx_listing_syndication_portal ON listing_syndication(portal_name);
CREATE INDEX idx_listing_syndication_status ON listing_syndication(status);
CREATE INDEX idx_listing_syndication_created ON listing_syndication(created_at);

ALTER TABLE listing_syndication ENABLE ROW LEVEL SECURITY;
CREATE POLICY listing_syndication_service_all ON listing_syndication FOR ALL TO service_role USING (true);
