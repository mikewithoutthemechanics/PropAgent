-- Agent Loop Supabase Quick Setup
-- Copy this entire file into Supabase SQL Editor and run
-- URL: https://app.supabase.com/project/sehweutpfftnrcbqshsn/sql-editor

-- ============================================
-- STEP 1: Create exec_sql helper function
-- ============================================
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- ============================================
-- STEP 2: Core Tables for Active Workflows
-- ============================================

-- Properties (for workflow 06)
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  suburb TEXT,
  city TEXT DEFAULT 'Johannesburg',
  bedrooms INTEGER,
  bathrooms INTEGER,
  garages INTEGER DEFAULT 0,
  monthly_rerent DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'unavailable')),
  ai_description TEXT,
  ai_description_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants (for workflow 05)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  lease_start_date DATE,
  lease_end_date DATE,
  monthly_rent DECIMAL(10,2),
  rent_due_day INTEGER DEFAULT 1 CHECK (rent_due_day >= 1 AND rent_due_day <= 31),
  payment_status TEXT DEFAULT 'current' CHECK (payment_status IN ('current', 'overdue', 'partial', 'paid_ahead')),
  preferred_contact_method TEXT DEFAULT 'whatsapp' CHECK (preferred_contact_method IN ('whatsapp', 'email', 'sms', 'call')),
  status TEXT DEFAULT 'prospect' CHECK (status IN ('prospect', 'applicant', 'approved', 'active', 'previous', 'blacklisted')),
  employer_name TEXT,
  monthly_income DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inquiries (for workflow 04)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('whatsapp', 'email', 'phone', 'website', 'facebook', 'instagram', 'referral')),
  source_id TEXT,
  message TEXT NOT NULL,
  raw_payload JSONB,
  intent_classified TEXT CHECK (intent_classified IN ('availability', 'viewing', 'pricing', 'application', 'maintenance', 'general')),
  urgency_detected TEXT CHECK (urgency_detected IN ('high', 'medium', 'low')),
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  ai_response TEXT,
  ai_confidence DECIMAL(3,2),
  tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'ai_responded', 'human_review', 'resolved', 'escalated', 'spam')),
  ai_responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rent Reminders (for workflow 05)
CREATE TABLE IF NOT EXISTS rent_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('upcoming', 'due_today', 'overdue', 'final_notice')),
  days_until_due INTEGER,
  days_overdue INTEGER,
  ai_message TEXT,
  message_channel TEXT DEFAULT 'whatsapp' CHECK (message_channel IN ('whatsapp', 'email', 'sms')),
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for DATE
);

-- Property Descriptions (for workflow 06)
CREATE TABLE IF NOT EXISTS property_descriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  input_features JSONB,
  input_style TEXT,
  input_tone TEXT,
  generated_description TEXT NOT NULL,
  headline TEXT,
  bullet_points TEXT[],
  model_used TEXT DEFAULT 'llama-3.3-70b-versatile',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FICA Documents (for workflow 10)
CREATE TABLE IF NOT EXISTS fica_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('id_document', 'proof_of_address', 'payslip', 'bank_statement', 'employment_letter', 'selfie', 'company_registration', 'tax_certificate')),
  file_path TEXT,
  ocr_extracted_text TEXT,
  ocr_confidence DECIMAL(3,2),
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'manual_review', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Scores (for workflow 07)
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

-- ============================================
-- STEP 3: Enable RLS
-- ============================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fica_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY properties_service_all ON properties FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY tenants_service_all ON tenants FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY inquiries_service_all ON inquiries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rent_reminders_service_all ON rent_reminders FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY property_descriptions_service_all ON property_descriptions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY fica_documents_service_all ON fica_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY lead_scores_service_all ON lead_scores FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 4: Create Indexes
-- ============================================
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_tenants_whatsapp ON tenants(whatsapp_number);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_rent_reminders_tenant ON rent_reminders(tenant_id);
CREATE INDEX idx_rent_reminders_scheduled ON rent_reminders(scheduled_for);

-- ============================================
-- STEP 5: Sample Data
-- ============================================

-- Sample properties
INSERT INTO properties (id, address, suburb, bedrooms, bathrooms, garages, monthly_rerent, status) VALUES
('11111111-1111-1111-1111-111111111111', '123 Main Street, Sandton', 'Sandton', 3, 2, 2, 18500.00, 'available'),
('22222222-2222-2222-2222-222222222222', '45 Rivonia Road, Rivonia', 'Rivonia', 2, 2, 1, 14500.00, 'rented')
ON CONFLICT (id) DO NOTHING;

-- Sample tenants
INSERT INTO tenants (id, first_name, last_name, whatsapp_number, property_id, lease_start_date, monthly_rent, rent_due_day, payment_status, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'John', 'Smith', '27821234567', '22222222-2222-2222-2222-222222222222', '2025-01-01', 14500.00, 1, 'current', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Sarah', 'Johnson', '27832345678', '22222222-2222-2222-2222-222222222222', '2024-06-01', 14500.00, 1, 'overdue', 'active')
ON CONFLICT (id) DO NOTHING;

-- Sample inquiries
INSERT INTO inquiries (id, source, source_id, message, intent_classified, sentiment, status) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', 'whatsapp', '27821234567', 'Hi, is the property still available?', 'availability', 'positive', 'new')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 6: Verify Setup
-- ============================================
SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
