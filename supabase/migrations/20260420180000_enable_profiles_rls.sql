-- Migration: enable row-level security on the profiles table and
-- move profile-row creation to a SECURITY DEFINER trigger that fires
-- when a new auth.users row is inserted.
--
-- Why:
-- 1. profiles was the only public table with RLS disabled. Any signed-in
--    user with the anon key could read every other user's profile.
-- 2. The client used to insert its own profile row after calling
--    supabase.auth.signUp(). With email confirmation enabled, there is
--    no session at that moment, so the client insert would be rejected
--    once the INSERT policy is in place. Using an on-auth.users trigger
--    instead means the profile row is created atomically with the user
--    and works regardless of the confirmation flow.

-- 1. Enable RLS and deny everything by default.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Policies: each user may read and update their own profile. INSERT is
--    intentionally allowed too so that client-side self-repair still works
--    if for some reason the trigger didn't run (e.g. legacy users).
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- service_role keeps full access for admin / server-side paths (cron, API routes).
DROP POLICY IF EXISTS "profiles_service_all" ON public.profiles;
CREATE POLICY "profiles_service_all"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Auto-create a profile row when a new auth.users row is inserted. The
--    function runs as SECURITY DEFINER so it is not blocked by the
--    policies above.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    'agent'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
