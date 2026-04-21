-- Migration: add an `onboarded_at` column to public.profiles so the app
-- has a server-authoritative signal for whether a user has completed the
-- new-user onboarding flow. Previously this was tracked only in
-- localStorage (`agentping-onboarded`), which meant:
--   * new browsers / incognito windows re-triggered onboarding,
--   * a user logged in on a second device was treated as brand new, and
--   * there was a split-second flash of dashboard before localStorage
--     hydrated and redirected to /onboarding.
--
-- `onboarded_at` is a nullable timestamptz set once the user finishes (or
-- skips) /onboarding. Existing rows stay NULL and are treated as
-- "not onboarded yet" — so existing demo/test users will see the flow the
-- next time they sign in, which matches the intent of the feature.
--
-- RLS policies from 20260420180000_enable_profiles_rls.sql already let each
-- user update their own profile row, so no new policies are needed.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.onboarded_at IS
  'When the user completed (or skipped) the initial onboarding flow. NULL = not yet onboarded.';
