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
