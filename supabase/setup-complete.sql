-- Migration: Create core PropAgent tables for Communication Platform
-- Created: 2026-03-23
-- Workflows: 04-tenant-inquiry, 05-rent-reminder, 06-property-description

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  suburb TEXT,
  city TEXT DEFAULT 'Johannesburg',
  province TEXT DEFAULT 'Gauteng',
  postal_code TEXT,
  
  -- Property details
  bedrooms INTEGER,
  bathrooms INTEGER,
  garages INTEGER DEFAULT 0,
  square_meters INTEGER,
  
  -- Financial
  monthly_rerent DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  
  -- Status
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'unavailable')),
  
  -- AI-generated content
  ai_description TEXT,
  ai_description_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE properties IS 'Property listings for rental management';
COMMENT ON COLUMN properties.ai_description IS 'AI-generated property description from workflow 06';

CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_suburb ON properties(suburb);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);

-- ============================================
-- TENANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Personal info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  
  -- ID/Passport
  id_number TEXT,
  id_type TEXT CHECK (id_type IN ('sa_id', 'passport', 'foreign_id')),
  
  -- Employment
  employer_name TEXT,
  monthly_income DECIMAL(10,2),
  employment_status TEXT CHECK (employment_status IN ('employed', 'self_employed', 'unemployed', 'student', 'retired')),
  
  -- Rental details
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_start_date DATE,
  lease_end_date DATE,
  monthly_rent DECIMAL(10,2),
  
  -- Rent payment tracking
  rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day >= 1 AND rent_due_day <= 31),
  last_payment_date DATE,
  payment_status TEXT DEFAULT 'current' CHECK (payment_status IN ('current', 'overdue', 'partial', 'paid_ahead')),
  
  -- Communication preferences
  preferred_contact_method TEXT DEFAULT 'whatsapp' CHECK (preferred_contact_method IN ('whatsapp', 'email', 'sms', 'call')),
  language_preference TEXT DEFAULT 'english' CHECK (language_preference IN ('english', 'afrikaans', 'zulu', 'xhosa', 'sotho')),
  
  -- Status
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'applicant', 'approved', 'active', 'previous', 'blacklisted')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE tenants IS 'Tenant information for rental management and rent reminders';
COMMENT ON COLUMN tenants.rent_due_day IS 'Day of month when rent is due (for workflow 05 reminders)';
COMMENT ON COLUMN tenants.payment_status IS 'Current payment status for rent tracking';

CREATE INDEX IF NOT EXISTS idx_tenants_property ON tenants(property_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_whatsapp ON tenants(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_tenants_payment_status ON tenants(payment_status);

-- ============================================
-- INQUIRIES TABLE (WhatsApp/Email Inquiries)
-- ============================================
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Source
  source TEXT NOT NULL CHECK (source IN ('whatsapp', 'email', 'phone', 'website', 'facebook', 'instagram', 'referral')),
  source_id TEXT, -- e.g., WhatsApp number or email address
  
  -- Inquiry content
  message TEXT NOT NULL,
  raw_payload JSONB, -- Store original webhook payload
  
  -- AI Analysis (from workflow 04)
  intent_classified TEXT CHECK (intent_classified IN ('availability', 'viewing', 'pricing', 'application', 'maintenance', 'general')),
  urgency_detected TEXT CHECK (urgency_detected IN ('high', 'medium', 'low')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  ai_response TEXT,
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  
  -- Linked records
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Status tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'ai_responded', 'human_review', 'resolved', 'escalated', 'spam')),
  
  -- Response tracking
  ai_responded_at TIMESTAMP WITH TIME ZONE,
  human_responded_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE inquiries IS 'WhatsApp/email inquiries processed by AI auto-responder (workflow 04)';
COMMENT ON COLUMN inquiries.intent_classified IS 'AI-detected intent from Groq analysis';
COMMENT ON COLUMN inquiries.ai_response IS 'AI-generated response sent to inquiry';

CREATE INDEX IF NOT EXISTS idx_inquiries_source ON inquiries(source);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_tenant ON inquiries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_intent ON inquiries(intent_classified);

-- ============================================
-- PROPERTY DESCRIPTIONS (AI Generated)
-- ============================================
CREATE TABLE IF NOT EXISTS property_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Input parameters (from workflow 06)
  input_features JSONB,
  input_style TEXT,
  input_tone TEXT,
  
  -- AI Output
  generated_description TEXT NOT NULL,
  headline TEXT,
  bullet_points TEXT[],
  
  -- AI Model info
  model_used TEXT DEFAULT 'llama-3.3-70b-versatile',
  generation_time_ms INTEGER,
  
  -- Usage tracking
  generation_cost DECIMAL(6,4), -- Cost in USD
  tokens_used INTEGER,
  
  -- Feedback
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'published')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE property_descriptions IS 'AI-generated property descriptions from workflow 06';

CREATE INDEX IF NOT EXISTS idx_property_descriptions_property ON property_descriptions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_descriptions_status ON property_descriptions(status);

-- ============================================
-- RENT REMINDERS (Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS rent_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Reminder details
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('upcoming', 'due_today', 'overdue', 'final_notice')),
  days_until_due INTEGER,
  days_overdue INTEGER,
  
  -- AI Content (from workflow 05)
  ai_message TEXT,
  message_channel TEXT DEFAULT 'whatsapp' CHECK (message_channel IN ('whatsapp', 'email', 'sms')),
  
  -- Status
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  -- Response tracking
  tenant_replied BOOLEAN DEFAULT FALSE,
  tenant_reply TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for DATE
);

COMMENT ON TABLE rent_reminders IS 'Rent reminder messages sent by workflow 05';
COMMENT ON COLUMN rent_reminders.ai_message IS 'AI-personalized reminder message';

CREATE INDEX IF NOT EXISTS idx_rent_reminders_tenant ON rent_reminders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_reminders_status ON rent_reminders(status);
CREATE INDEX IF NOT EXISTS idx_rent_reminders_scheduled ON rent_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_rent_reminders_type ON rent_reminders(reminder_type);

-- ============================================
-- FICA DOCUMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS fica_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Document info
  document_type TEXT NOT NULL CHECK (document_type IN ('id_document', 'proof_of_address', 'payslip', 'bank_statement', 'employment_letter', 'selfie', 'company_registration', 'tax_certificate')),
  document_number TEXT,
  
  -- File storage
  file_path TEXT,
  file_url TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- OCR Data (from workflow 10)
  ocr_extracted_text TEXT,
  ocr_confidence DECIMAL(3,2),
  ocr_extracted_data JSONB, -- Structured data like ID number, name, etc.
  
  -- Validation
  extracted_id_number TEXT,
  extracted_name TEXT,
  extracted_address TEXT,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'manual_review', 'expired')),
  validation_errors TEXT[],
  
  -- Document metadata
  issue_date DATE,
  expiry_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE fica_documents IS 'FICA compliance documents with OCR processing';

CREATE INDEX IF NOT EXISTS idx_fica_tenant ON fica_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fica_type ON fica_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fica_status ON fica_documents(validation_status);

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fica_documents ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow service role full access)
-- ============================================
CREATE POLICY properties_service_all ON properties FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY tenants_service_all ON tenants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY inquiries_service_all ON inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY property_descriptions_service_all ON property_descriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rent_reminders_service_all ON rent_reminders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY fica_documents_service_all ON fica_documents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read (adjust as needed)
CREATE POLICY properties_auth_read ON properties FOR SELECT TO authenticated USING (true);
CREATE POLICY tenants_auth_read ON tenants FOR SELECT TO authenticated USING (true);
CREATE POLICY inquiries_auth_read ON inquiries FOR SELECT TO authenticated USING (true);
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
-- Migration: Seed sample data for PropAgent testing
-- Created: 2026-03-23

-- ============================================
-- SAMPLE PROPERTIES
-- ============================================
INSERT INTO properties (id, address, suburb, city, bedrooms, bathrooms, garages, monthly_rerent, deposit_amount, status) VALUES
('11111111-1111-1111-1111-111111111111', '123 Main Street', 'Sandton', 'Johannesburg', 3, 2, 2, 18500.00, 18500.00, 'available'),
('22222222-2222-2222-2222-222222222222', '45 Rivonia Road', 'Rivonia', 'Johannesburg', 2, 2, 1, 14500.00, 14500.00, 'rented'),
('33333333-3333-3333-3333-333333333333', '78 Sunset Boulevard', 'Fourways', 'Johannesburg', 4, 3, 2, 25000.00, 25000.00, 'available'),
('44444444-4444-4444-4444-444444444444', '12 Rose Avenue', 'Hyde Park', 'Johannesburg', 1, 1, 1, 9500.00, 9500.00, 'maintenance')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE TENANTS
-- ============================================
INSERT INTO tenants (
  id, first_name, last_name, email, phone, whatsapp_number, 
  property_id, lease_start_date, lease_end_date, monthly_rent, rent_due_day,
  payment_status, preferred_contact_method, status, employer_name, monthly_income
) VALUES
-- Active tenant with rent due soon (for reminder testing)
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Smith', 'john.smith@email.com', '27821234567', '27821234567',
 '22222222-2222-2222-2222-222222222222', '2025-01-01', '2026-01-01', 14500.00, 1,
 'current', 'whatsapp', 'active', 'ABC Corporation', 45000.00),

-- Tenant with overdue rent
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah', 'Johnson', 'sarah.j@email.com', '27832345678', '27832345678',
 '22222222-2222-2222-2222-222222222222', '2024-06-01', '2025-06-01', 14500.00, 1,
 'overdue', 'email', 'active', 'Tech Solutions Ltd', 38000.00),

-- Prospect (no property yet)
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Michael', 'Brown', 'mbrown@email.com', '27843456789', '27843456789',
 NULL, NULL, NULL, NULL, NULL,
 NULL, 'whatsapp', 'prospect', 'Standard Bank', 52000.00),

-- Active tenant
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Emily', 'Davis', 'emily.davis@email.com', '27854567890', '27854567890',
 '33333333-3333-3333-3333-333333333333', '2025-02-01', '2026-02-01', 25000.00, 1,
 'current', 'whatsapp', 'active', 'Discovery Health', 65000.00)

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE INQUIRIES
-- ============================================
INSERT INTO inquiries (
  id, source, source_id, message, intent_classified, urgency_detected, sentiment,
  ai_response, ai_confidence, tenant_id, property_id, status, ai_responded_at
) VALUES
('inq-1111-1111-1111-111111111111', 'whatsapp', '27821234567', 
 'Hi, I saw your property listing. Is it still available? Can I schedule a viewing for this weekend?',
 'availability', 'medium', 'positive',
 'Hello! Thank you for your interest. Yes, the property is still available. We''d be happy to schedule a viewing this weekend. Would Saturday at 10 AM or Sunday at 2 PM work better for you?',
 0.92, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ai_responded', NOW()),

('inq-2222-2222-2222-222222222222', 'email', 'sarah.j@email.com',
 'I''m looking for a 2 bedroom apartment in Sandton area. What do you have available?',
 'availability', 'low', 'neutral',
 'Thank you for reaching out! We have several 2-bedroom properties available in Sandton. Our current listings range from R14,500 to R18,500 per month. Would you like me to send you detailed information on available units?',
 0.88, NULL, NULL, 'ai_responded', NOW()),

('inq-3333-3333-3333-333333333333', 'whatsapp', '27843456789',
 'URGENT: My toilet is leaking and water is everywhere! I need help immediately!',
 'maintenance', 'high', 'urgent',
 'I understand this is urgent! I''m escalating this to our maintenance team immediately. Someone will contact you within 30 minutes. In the meantime, please turn off the water main if possible and place towels to prevent damage.',
 0.95, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'escalated', NOW())

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE RENT REMINDERS
-- ============================================
INSERT INTO rent_reminders (
  id, tenant_id, property_id, reminder_type, days_until_due, days_overdue,
  ai_message, message_channel, status, scheduled_for
) VALUES
('rem-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 '22222222-2222-2222-2222-222222222222', 'upcoming', 2, NULL,
 'Hi John! Just a friendly reminder that your rent of R14,500 is due in 2 days (1st of the month). If you''ve already paid, please ignore this message. Thank you! 🏠',
 'whatsapp', 'pending', CURRENT_DATE + INTERVAL '2 days'),

('rem-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222', 'overdue', NULL, 5,
 'Hi Sarah, this is a reminder that your rent payment of R14,500 was due 5 days ago. Please arrange payment as soon as possible to avoid late fees. If you''re experiencing difficulties, please contact us to discuss payment arrangements.',
 'email', 'pending', CURRENT_DATE),

('rem-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
 '33333333-3333-3333-3333-333333333333', 'due_today', 0, NULL,
 'Hi Emily! Your rent of R25,000 is due today. Thank you for being such a reliable tenant. If you have any questions, feel free to reach out.',
 'whatsapp', 'sent', CURRENT_DATE)

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE AI GENERATED PROPERTY DESCRIPTIONS
-- ============================================
INSERT INTO property_descriptions (
  id, property_id, input_features, input_style, input_tone,
  generated_description, headline, bullet_points, model_used, status
) VALUES
('desc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 '{"bedrooms": 3, "bathrooms": 2, "garage": true, "pool": false, "garden": true}'::jsonb,
 'modern', 'professional',
 'Discover modern luxury living in the heart of Sandton! This stunning 3-bedroom, 2-bathroom home offers contemporary design with premium finishes throughout. The open-plan living area flows seamlessly to a private garden, perfect for entertaining. Features include a double garage, modern kitchen with granite countertops, and 24-hour security. Located minutes from Sandton City and major transport routes. Available immediately at R18,500/month.',
 'Modern 3-Bedroom Sanctuary in Prime Sandton Location',
 ARRAY['3 spacious bedrooms with built-in cupboards', '2 modern bathrooms (main en-suite)', 'Double garage with direct access', 'Private garden with entertainment area', '24-hour security estate', 'Close to Sandton City and Gautrain'],
 'llama-3.3-70b-versatile',
 'approved'),

('desc-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
 '{"bedrooms": 4, "bathrooms": 3, "garage": true, "pool": true, "garden": true}'::jsonb,
 'luxury', 'professional',
 'Experience unparalleled luxury in this exquisite 4-bedroom family estate in prestigious Fourways. This architectural masterpiece features 3 bathrooms, a sparkling swimming pool, and expansive gardens. The gourmet kitchen, multiple living areas, and entertainment spaces make this home perfect for discerning families seeking the finest in Johannesburg living.',
 'Luxurious 4-Bedroom Estate with Pool in Fourways',
 ARRAY['4 generous bedrooms', '3 bathrooms plus guest toilet', 'Swimming pool and landscaped garden', 'Double garage plus visitor parking', 'Premium finishes throughout', 'Exclusive security estate'],
 'llama-3.3-70b-versatile',
 'draft')

ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE PROPERTY DESCRIPTIONS LINKS
-- ============================================
UPDATE properties 
SET ai_description = (SELECT generated_description FROM property_descriptions WHERE property_id = properties.id AND status = 'approved' LIMIT 1),
    ai_description_generated_at = NOW()
WHERE id IN ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333');
