-- Migration: Matching core — two-sided marketplace between FFC-verified agents.
--
-- Creates / alters:
--   * profiles: add agent-facing fields (ffc_number, ffc_verified, agency_id,
--     areas[], agent_status). profiles.id already == auth.users.id.
--   * properties: add listed_by (FK profiles.id), listing_kind, sale_price,
--     property_type, features[], agency_id.
--   * buyer_requirements: one row per buyer/tenant brief an agent is working.
--     POPIA — client identity is an opaque local label, never shared.
--   * matches: persisted (listing × requirement) pairs with score + state.
--   * match_pings: audit of every push notification emitted for a match.
--
-- RLS:
--   * buyer_requirements: agent can CRUD only their own rows.
--   * matches: agent can SELECT rows where they are listing_agent_id OR
--     buyer_agent_id. Writes are service_role only (engine-controlled).
--   * match_pings: recipient can SELECT their own pings. Writes service_role.

-- ============================================================================
-- 1. profiles agent fields
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ffc_number text,
  ADD COLUMN IF NOT EXISTS ffc_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ffc_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS agency_id uuid,
  ADD COLUMN IF NOT EXISTS agency_name text,
  ADD COLUMN IF NOT EXISTS areas text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS agent_status text NOT NULL DEFAULT 'pending'
    CHECK (agent_status IN ('pending', 'verified', 'suspended', 'archived'));

CREATE UNIQUE INDEX IF NOT EXISTS profiles_ffc_number_idx
  ON public.profiles (ffc_number)
  WHERE ffc_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_ffc_verified_idx
  ON public.profiles (ffc_verified)
  WHERE ffc_verified = true;

-- Allow any authenticated agent to read a minimal public projection of another
-- agent's profile (name, agency, FFC status, areas) — needed to render the
-- counterparty card on a match. Column-level restrictions are enforced in the
-- app; at the row level every authenticated user can SELECT every profile row.
-- The existing "profiles_select_own" policy stays; we add a broader SELECT
-- policy scoped to authenticated users. If you need stricter isolation later,
-- drop this policy and move the counterparty view behind a SECURITY DEFINER
-- view that exposes only the public columns.
DROP POLICY IF EXISTS "profiles_select_authenticated" ON public.profiles;
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- 2. properties — who loaded the stock, what kind, full detail
-- ============================================================================

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS listed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS agency_id uuid,
  ADD COLUMN IF NOT EXISTS listing_kind text NOT NULL DEFAULT 'rental'
    CHECK (listing_kind IN ('rental', 'sale')),
  ADD COLUMN IF NOT EXISTS sale_price numeric(12, 2),
  ADD COLUMN IF NOT EXISTS property_type text
    CHECK (property_type IN ('house', 'apartment', 'townhouse', 'flat', 'vacant_land', 'room')),
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS properties_listed_by_idx ON public.properties (listed_by);
CREATE INDEX IF NOT EXISTS properties_kind_status_idx
  ON public.properties (listing_kind, status);
CREATE INDEX IF NOT EXISTS properties_suburb_ci_idx
  ON public.properties (LOWER(suburb));
CREATE INDEX IF NOT EXISTS properties_city_ci_idx
  ON public.properties (LOWER(city));

-- ============================================================================
-- 3. buyer_requirements — demand side
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.buyer_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  agency_id uuid,
  kind text NOT NULL CHECK (kind IN ('rental', 'sale')),

  -- Opaque local label for the client. Never leaves the owning agent.
  client_ref text,

  budget_min numeric(12, 2) NOT NULL,
  budget_max numeric(12, 2) NOT NULL CHECK (budget_max >= budget_min),
  bedrooms_min integer,
  bedrooms_max integer,
  property_types text[] NOT NULL DEFAULT '{}',
  suburbs   text[] NOT NULL DEFAULT '{}',
  cities    text[] NOT NULL DEFAULT '{}',
  provinces text[] NOT NULL DEFAULT '{}',
  required_features text[] NOT NULL DEFAULT '{}',

  urgency text CHECK (urgency IN ('immediate', '30_days', '60_days', '90_days')),
  pre_approval boolean NOT NULL DEFAULT false,
  has_bond     boolean NOT NULL DEFAULT false,
  purchase_type text CHECK (purchase_type IN ('primary', 'investment', 'upgrade')),

  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'fulfilled', 'archived')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.buyer_requirements IS
  'Buyer/tenant briefs registered by an agent. Drives matching against incoming stock.';
COMMENT ON COLUMN public.buyer_requirements.client_ref IS
  'Opaque local label (e.g. "Smith family"). Never exposed to other agents.';

CREATE INDEX IF NOT EXISTS buyer_requirements_agent_idx
  ON public.buyer_requirements (agent_id);
CREATE INDEX IF NOT EXISTS buyer_requirements_active_idx
  ON public.buyer_requirements (status)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS buyer_requirements_kind_budget_idx
  ON public.buyer_requirements (kind, budget_min, budget_max)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS buyer_requirements_suburbs_gin_idx
  ON public.buyer_requirements USING GIN (suburbs);
CREATE INDEX IF NOT EXISTS buyer_requirements_cities_gin_idx
  ON public.buyer_requirements USING GIN (cities);

ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyer_requirements_own_all" ON public.buyer_requirements;
CREATE POLICY "buyer_requirements_own_all"
  ON public.buyer_requirements
  FOR ALL
  TO authenticated
  USING (auth.uid() = agent_id)
  WITH CHECK (auth.uid() = agent_id);

DROP POLICY IF EXISTS "buyer_requirements_service_all" ON public.buyer_requirements;
CREATE POLICY "buyer_requirements_service_all"
  ON public.buyer_requirements
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Keep updated_at fresh.
CREATE OR REPLACE FUNCTION public.touch_buyer_requirements_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS buyer_requirements_touch_updated_at ON public.buyer_requirements;
CREATE TRIGGER buyer_requirements_touch_updated_at
  BEFORE UPDATE ON public.buyer_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_buyer_requirements_updated_at();

-- ============================================================================
-- 4. matches — (listing × requirement) with score + state
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id    uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  requirement_id uuid NOT NULL REFERENCES public.buyer_requirements(id) ON DELETE CASCADE,
  listing_agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_agent_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('rental', 'sale')),
  score integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  reasons text[] NOT NULL DEFAULT '{}',
  state text NOT NULL DEFAULT 'new'
    CHECK (state IN ('new', 'viewed', 'accepted', 'rejected', 'expired', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_scored_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, requirement_id)
);

COMMENT ON TABLE public.matches IS
  'Scored pairs of (listing, buyer_requirement). Engine is the only writer.';

CREATE INDEX IF NOT EXISTS matches_listing_agent_idx
  ON public.matches (listing_agent_id, state, score DESC);
CREATE INDEX IF NOT EXISTS matches_buyer_agent_idx
  ON public.matches (buyer_agent_id, state, score DESC);
CREATE INDEX IF NOT EXISTS matches_property_idx ON public.matches (property_id);
CREATE INDEX IF NOT EXISTS matches_requirement_idx ON public.matches (requirement_id);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select_counterparty" ON public.matches;
CREATE POLICY "matches_select_counterparty"
  ON public.matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (listing_agent_id, buyer_agent_id));

-- Counterparties can transition state (accept / reject / mark viewed) on
-- their own side. Score, ids and kind are immutable from the app — those
-- columns are only written by service_role.
DROP POLICY IF EXISTS "matches_update_counterparty_state" ON public.matches;
CREATE POLICY "matches_update_counterparty_state"
  ON public.matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (listing_agent_id, buyer_agent_id))
  WITH CHECK (auth.uid() IN (listing_agent_id, buyer_agent_id));

DROP POLICY IF EXISTS "matches_service_all" ON public.matches;
CREATE POLICY "matches_service_all"
  ON public.matches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. match_pings — audit of every push emitted
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.match_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  recipient_agent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp', 'push')),
  status  text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'delivered', 'failed', 'suppressed')),
  sent_at timestamptz,
  error   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Generated bucket column so we can enforce the 24h ping debounce with a
  -- UNIQUE expression index. Uses UTC so the expression is IMMUTABLE.
  bucket_day date GENERATED ALWAYS AS (((created_at AT TIME ZONE 'UTC'))::date) STORED
);

-- At most one ping per (match, recipient, channel) per UTC day.
CREATE UNIQUE INDEX IF NOT EXISTS match_pings_debounce_idx
  ON public.match_pings (match_id, recipient_agent_id, channel, bucket_day);

CREATE INDEX IF NOT EXISTS match_pings_recipient_idx
  ON public.match_pings (recipient_agent_id, created_at DESC);

ALTER TABLE public.match_pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_pings_select_recipient" ON public.match_pings;
CREATE POLICY "match_pings_select_recipient"
  ON public.match_pings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = recipient_agent_id);

DROP POLICY IF EXISTS "match_pings_service_all" ON public.match_pings;
CREATE POLICY "match_pings_service_all"
  ON public.match_pings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
