-- Viewing Scheduler AI - Supabase Database Schema
-- Project: PropAgent - South African Real Estate Platform

-- ============================================================
-- TABLE: viewing_requests
-- Stores all viewing requests parsed by AI
-- ============================================================
CREATE TABLE IF NOT EXISTS viewing_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  property_id UUID REFERENCES properties(id),
  property_address TEXT,
  parsed_preferences JSONB DEFAULT '[]'::jsonb,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('high', 'medium', 'low')),
  suggested_slots JSONB DEFAULT '[]'::jsonb,
  confirmed_slot TIMESTAMP WITH TIME ZONE,
  agent_id UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'pending_confirmation', 'confirmed', 'completed', 'cancelled', 'no_show')),
  special_requirements JSONB DEFAULT '[]'::jsonb,
  party_size INTEGER DEFAULT 1,
  client_type TEXT DEFAULT 'curious' CHECK (client_type IN ('serious_buyer', 'curious', 'investor', 'first_time')),
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'webhook',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_viewing_requests_status ON viewing_requests(status);
CREATE INDEX idx_viewing_requests_agent_id ON viewing_requests(agent_id);
CREATE INDEX idx_viewing_requests_property_id ON viewing_requests(property_id);
CREATE INDEX idx_viewing_requests_created_at ON viewing_requests(created_at);
CREATE INDEX idx_viewing_requests_urgency ON viewing_requests(urgency);

-- ============================================================
-- TABLE: agent_availability
-- Stores agent calendar availability and booked slots
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL,
  date DATE NOT NULL,
  available_slots JSONB DEFAULT '["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]'::jsonb,
  booked_slots JSONB DEFAULT '[]'::jsonb,
  is_working_day BOOLEAN DEFAULT TRUE,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, date)
);

CREATE INDEX idx_agent_availability_agent_id ON agent_availability(agent_id);
CREATE INDEX idx_agent_availability_date ON agent_availability(date);
CREATE INDEX idx_agent_availability_agent_date ON agent_availability(agent_id, date);

-- ============================================================
-- TABLE: viewing_feedback
-- Stores post-viewing feedback from clients
-- ============================================================
CREATE TABLE IF NOT EXISTS viewing_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewing_request_id UUID REFERENCES viewing_requests(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  interest_level TEXT CHECK (interest_level IN ('high', 'medium', 'low', 'not_interested')),
  feedback_text TEXT,
  follow_up_requested BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_viewing_feedback_viewing_id ON viewing_feedback(viewing_request_id);

-- ============================================================
-- TABLE: viewing_reminders
-- Stores reminder logs for scheduled viewings
-- ============================================================
CREATE TABLE IF NOT EXISTS viewing_reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  viewing_request_id UUID REFERENCES viewing_requests(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', '30min')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel TEXT CHECK (channel IN ('sms', 'whatsapp', 'email', 'push')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  error_message TEXT
);

CREATE INDEX idx_viewing_reminders_viewing_id ON viewing_reminders(viewing_request_id);

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Agents can see their own availability
CREATE POLICY agent_availability_agent_policy ON agent_availability
  FOR ALL
  USING (agent_id = auth.uid());

-- Policy: Agents can see viewing requests assigned to them
CREATE POLICY viewing_requests_agent_policy ON viewing_requests
  FOR ALL
  USING (agent_id = auth.uid());

-- Policy: Public can insert viewing requests
CREATE POLICY viewing_requests_public_insert ON viewing_requests
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin can see all
CREATE POLICY viewing_requests_admin_policy ON viewing_requests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for viewing_requests
CREATE TRIGGER update_viewing_requests_updated_at
  BEFORE UPDATE ON viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for agent_availability
CREATE TRIGGER update_agent_availability_updated_at
  BEFORE UPDATE ON agent_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to check and book slot
CREATE OR REPLACE FUNCTION book_viewing_slot(
  p_request_id UUID,
  p_slot_datetime TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_agent_id UUID;
  v_date DATE;
  v_time TEXT;
  v_available_slots JSONB;
  v_booked_slots JSONB;
BEGIN
  -- Get agent_id from viewing request
  SELECT agent_id INTO v_agent_id
  FROM viewing_requests
  WHERE id = p_request_id;
  
  IF v_agent_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Extract date and time
  v_date := p_slot_datetime::DATE;
  v_time := TO_CHAR(p_slot_datetime, 'HH24:MI');
  
  -- Get current availability
  SELECT available_slots, booked_slots
  INTO v_available_slots, v_booked_slots
  FROM agent_availability
  WHERE agent_id = v_agent_id AND date = v_date;
  
  -- Check if slot is available
  IF v_available_slots @> to_jsonb(v_time) 
     AND NOT (v_booked_slots @> to_jsonb(v_time)) THEN
    
    -- Update booked slots
    UPDATE agent_availability
    SET booked_slots = booked_slots || to_jsonb(v_time)
    WHERE agent_id = v_agent_id AND date = v_date;
    
    -- Update viewing request
    UPDATE viewing_requests
    SET confirmed_slot = p_slot_datetime,
        status = 'confirmed',
        updated_at = NOW()
    WHERE id = p_request_id;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get available slots for a date range
CREATE OR REPLACE FUNCTION get_available_slots(
  p_agent_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  available_date DATE,
  available_times TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    aa.date,
    ARRAY(
      SELECT jsonb_array_elements_text(aa.available_slots)
      EXCEPT
      SELECT jsonb_array_elements_text(aa.booked_slots)
    )::TEXT[] as available_times
  FROM agent_availability aa
  WHERE aa.agent_id = p_agent_id
    AND aa.date BETWEEN p_start_date AND p_end_date
    AND aa.is_working_day = TRUE
  ORDER BY aa.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cancel viewing and free up slot
CREATE OR REPLACE FUNCTION cancel_viewing(
  p_request_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_agent_id UUID;
  v_confirmed_slot TIMESTAMP WITH TIME ZONE;
  v_date DATE;
  v_time TEXT;
BEGIN
  -- Get viewing details
  SELECT agent_id, confirmed_slot
  INTO v_agent_id, v_confirmed_slot
  FROM viewing_requests
  WHERE id = p_request_id;
  
  IF v_confirmed_slot IS NULL THEN
    -- Just update status if no slot was booked
    UPDATE viewing_requests
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE id = p_request_id;
    RETURN TRUE;
  END IF;
  
  -- Extract date and time
  v_date := v_confirmed_slot::DATE;
  v_time := TO_CHAR(v_confirmed_slot, 'HH24:MI');
  
  -- Remove from booked slots
  UPDATE agent_availability
  SET booked_slots = booked_slots - v_time
  WHERE agent_id = v_agent_id AND date = v_date;
  
  -- Update viewing request
  UPDATE viewing_requests
  SET status = 'cancelled',
      confirmed_slot = NULL,
      updated_at = NOW()
  WHERE id = p_request_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample agent availability for next 14 days
INSERT INTO agent_availability (agent_id, date, available_slots, is_working_day)
SELECT 
  '00000000-0000-0000-0000-000000000001'::UUID as agent_id,
  CURRENT_DATE + i as date,
  '["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"]'::jsonb as available_slots,
  CASE WHEN EXTRACT(DOW FROM CURRENT_DATE + i) IN (0, 6) THEN FALSE ELSE TRUE END as is_working_day
FROM generate_series(0, 14) as i
ON CONFLICT (agent_id, date) DO NOTHING;

-- ============================================================
-- NOTES
-- ============================================================
--
-- Required Environment Variables for n8n:
-- - GROQ_API_KEY: Your Groq API key
-- - SUPABASE_URL: Your Supabase project URL
-- - SUPABASE_SERVICE_KEY: Your Supabase service role key
-- - TWILIO_ACCOUNT_SID: Twilio account SID (for WhatsApp/SMS)
-- - TWILIO_AUTH_TOKEN: Twilio auth token
-- - WHATSAPP_FROM_NUMBER: Your Twilio WhatsApp number
-- - SENDGRID_API_KEY: SendGrid API key (for email fallback)
--
-- Groq Model Used: llama-3.1-8b-instant (free tier)
-- Rate Limits: 20 requests/minute, 1,000,000 tokens/day
--
-- ============================================================
