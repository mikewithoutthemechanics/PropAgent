-- Migration: PayFast subscription billing.
--
-- Creates:
--   * public.subscriptions — one row per checkout attempt, indexed by the
--     m_payment_id we generate client-side (UUID). Moves through
--     pending -> active | cancelled | failed as PayFast ITNs land.
--   * public.payfast_events — append-only audit log of every ITN callback.
--   * profiles.subscription_tier / _status / _updated_at — the fast-path
--     entitlement check for feature gating in the UI.
--
-- RLS:
--   * subscriptions: authenticated users can SELECT their own rows.
--     INSERT/UPDATE/DELETE is restricted to service_role only — the only
--     writers are /api/payfast/initiate and /api/payfast/itn.
--   * payfast_events: service_role only. Users don't need to see raw
--     webhook payloads.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  price_zar numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'cancelled', 'failed')),
  payfast_token text,
  pf_payment_id text,
  last_payment_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx
  ON public.subscriptions (user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx
  ON public.subscriptions (status);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "subscriptions_service_all" ON public.subscriptions;
CREATE POLICY "subscriptions_service_all"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.payfast_events (
  id bigserial PRIMARY KEY,
  m_payment_id uuid,
  pf_payment_id text,
  user_id uuid,
  plan_id text,
  payment_status text,
  amount_gross numeric(10, 2),
  raw jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payfast_events_m_payment_id_idx
  ON public.payfast_events (m_payment_id);
CREATE INDEX IF NOT EXISTS payfast_events_user_id_idx
  ON public.payfast_events (user_id);

ALTER TABLE public.payfast_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payfast_events_service_all" ON public.payfast_events;
CREATE POLICY "payfast_events_service_all"
  ON public.payfast_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Profile entitlement columns.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_tier text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS subscription_updated_at timestamptz;

-- Keep subscriptions.updated_at fresh on every UPDATE.
CREATE OR REPLACE FUNCTION public.touch_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_touch_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_touch_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_subscriptions_updated_at();
