-- BC ONE loyalty MVP — PostgreSQL draft schema
-- Not deployed. Loyalty points only; separate from any ERC-20 token.
BEGIN;

CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY,
  email_normalized TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'support', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS benefits (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '',
  points_cost BIGINT NOT NULL CHECK (points_cost > 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  total_redemption_limit BIGINT CHECK (total_redemption_limit IS NULL OR total_redemption_limit >= 0),
  per_member_limit BIGINT NOT NULL DEFAULT 1 CHECK (per_member_limit > 0),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'retired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  amount BIGINT NOT NULL CHECK (amount <> 0),
  entry_type TEXT NOT NULL
    CHECK (entry_type IN ('welcome_credit', 'earned_credit', 'redemption_debit', 'admin_adjustment', 'reversal')),
  reference_type TEXT,
  reference_id UUID,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES members(id),
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 240),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ledger_member_created_idx
  ON ledger_entries (member_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id),
  benefit_id UUID NOT NULL REFERENCES benefits(id),
  points_cost BIGINT NOT NULL CHECK (points_cost > 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled', 'reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS redemptions_member_benefit_idx
  ON redemptions (member_id, benefit_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY,
  actor_member_id UUID REFERENCES members(id),
  action TEXT NOT NULL CHECK (char_length(action) BETWEEN 1 AND 100),
  target_type TEXT NOT NULL,
  target_id UUID,
  reason TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_events_created_idx
  ON audit_events (created_at DESC, id DESC);

COMMIT;

-- Important implementation requirement:
-- Every credit/debit/redemption must run in a single database transaction:
-- lock the member balance/ledger scope, validate current balance and benefit limits,
-- insert the idempotency key, insert ledger + redemption rows, then commit.
-- This schema is a starting point, not a complete production security solution.
