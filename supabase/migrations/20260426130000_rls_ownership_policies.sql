-- Add user_id ownership column to core tables and create proper RLS policies
-- so that authenticated users can only see/modify their own data.

-- 1. Add user_id columns (nullable initially so existing rows don't break)
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.rent_reminders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.property_descriptions ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.fica_documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create indexes for user_id lookups
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user_id ON public.tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_id ON public.inquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_rent_reminders_user_id ON public.rent_reminders(user_id);

-- 3. Drop overly-permissive "authenticated can read all" policies
DROP POLICY IF EXISTS properties_auth_read ON public.properties;
DROP POLICY IF EXISTS tenants_auth_read ON public.tenants;
DROP POLICY IF EXISTS inquiries_auth_read ON public.inquiries;

-- 4. Create ownership-based policies for authenticated users
-- Properties
CREATE POLICY properties_own_select ON public.properties
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY properties_own_insert ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY properties_own_update ON public.properties
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY properties_own_delete ON public.properties
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Tenants
CREATE POLICY tenants_own_select ON public.tenants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY tenants_own_insert ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY tenants_own_update ON public.tenants
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY tenants_own_delete ON public.tenants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Inquiries
CREATE POLICY inquiries_own_select ON public.inquiries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY inquiries_own_insert ON public.inquiries
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Rent reminders
CREATE POLICY rent_reminders_own_select ON public.rent_reminders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY rent_reminders_own_insert ON public.rent_reminders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Property descriptions
CREATE POLICY property_descriptions_own_select ON public.property_descriptions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY property_descriptions_own_insert ON public.property_descriptions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- FICA documents
CREATE POLICY fica_documents_own_select ON public.fica_documents
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY fica_documents_own_insert ON public.fica_documents
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
