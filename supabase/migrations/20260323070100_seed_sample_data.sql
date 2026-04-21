-- Migration: Seed sample data for Agent Loop testing
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
('aaaaaaaa-1111-1111-1111-111111111111', 'whatsapp', '27821234567', 
 'Hi, I saw your property listing. Is it still available? Can I schedule a viewing for this weekend?',
 'availability', 'medium', 'positive',
 'Hello! Thank you for your interest. Yes, the property is still available. We''d be happy to schedule a viewing this weekend. Would Saturday at 10 AM or Sunday at 2 PM work better for you?',
 0.92, 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'ai_responded', NOW()),

('aaaaaaaa-2222-2222-2222-222222222222', 'email', 'sarah.j@email.com',
 'I''m looking for a 2 bedroom apartment in Sandton area. What do you have available?',
 'availability', 'low', 'neutral',
 'Thank you for reaching out! We have several 2-bedroom properties available in Sandton. Our current listings range from R14,500 to R18,500 per month. Would you like me to send you detailed information on available units?',
 0.88, NULL, NULL, 'ai_responded', NOW()),

('aaaaaaaa-3333-3333-3333-333333333333', 'whatsapp', '27843456789',
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
('bbbbbbbb-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 '22222222-2222-2222-2222-222222222222', 'upcoming', 2, NULL,
 'Hi John! Just a friendly reminder that your rent of R14,500 is due in 2 days (1st of the month). If you''ve already paid, please ignore this message. Thank you! 🏠',
 'whatsapp', 'pending', CURRENT_DATE + INTERVAL '2 days'),

('bbbbbbbb-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
 '22222222-2222-2222-2222-222222222222', 'overdue', NULL, 5,
 'Hi Sarah, this is a reminder that your rent payment of R14,500 was due 5 days ago. Please arrange payment as soon as possible to avoid late fees. If you''re experiencing difficulties, please contact us to discuss payment arrangements.',
 'email', 'pending', CURRENT_DATE),

('bbbbbbbb-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd',
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
('cccccccc-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
 '{"bedrooms": 3, "bathrooms": 2, "garage": true, "pool": false, "garden": true}'::jsonb,
 'modern', 'professional',
 'Discover modern luxury living in the heart of Sandton! This stunning 3-bedroom, 2-bathroom home offers contemporary design with premium finishes throughout. The open-plan living area flows seamlessly to a private garden, perfect for entertaining. Features include a double garage, modern kitchen with granite countertops, and 24-hour security. Located minutes from Sandton City and major transport routes. Available immediately at R18,500/month.',
 'Modern 3-Bedroom Sanctuary in Prime Sandton Location',
 ARRAY['3 spacious bedrooms with built-in cupboards', '2 modern bathrooms (main en-suite)', 'Double garage with direct access', 'Private garden with entertainment area', '24-hour security estate', 'Close to Sandton City and Gautrain'],
 'llama-3.3-70b-versatile',
 'approved'),

('cccccccc-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333',
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
