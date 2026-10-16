-- BC ONE partner commerce schema — draft, not deployed.
-- All money values are integer cents; payment card data must never be stored here.
BEGIN;

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY,
  legal_name TEXT NOT NULL CHECK (char_length(legal_name) BETWEEN 1 AND 180),
  public_name TEXT NOT NULL CHECK (char_length(public_name) BETWEEN 1 AND 100),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'suspended', 'closed')),
  commission_bps INTEGER NOT NULL DEFAULT 200 CHECK (commission_bps BETWEEN 0 AND 10000),
  commission_agreement_version TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_purchases (
  id UUID PRIMARY KEY,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  member_id UUID REFERENCES members(id),
  currency CHAR(3) NOT NULL DEFAULT 'EUR' CHECK (currency = 'EUR'),
  gross_cents BIGINT NOT NULL CHECK (gross_cents > 0),
  commission_bps INTEGER NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
  commission_cents BIGINT NOT NULL CHECK (commission_cents >= 0 AND commission_cents <= gross_cents),
  merchant_net_cents BIGINT NOT NULL CHECK (merchant_net_cents >= 0),
  payment_provider TEXT NOT NULL,
  provider_payment_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'partially_refunded', 'refunded', 'cancelled', 'failed')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payment_provider, provider_payment_id),
  CHECK (commission_cents + merchant_net_cents = gross_cents),
  CHECK ((status = 'paid' AND paid_at IS NOT NULL) OR status <> 'paid')
);

CREATE INDEX IF NOT EXISTS partner_purchases_merchant_created_idx
  ON partner_purchases (merchant_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS partner_purchases_member_created_idx
  ON partner_purchases (member_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS purchase_commission_entries (
  id UUID PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES partner_purchases(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('commission_accrual', 'commission_reversal', 'manual_adjustment')),
  amount_cents BIGINT NOT NULL CHECK (amount_cents <> 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL CHECK (char_length(reason) BETWEEN 1 AND 240),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchase_commission_purchase_created_idx
  ON purchase_commission_entries (purchase_id, created_at DESC);

CREATE TABLE IF NOT EXISTS purchase_refunds (
  id UUID PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES partner_purchases(id),
  provider_refund_id TEXT NOT NULL UNIQUE,
  refund_cents BIGINT NOT NULL CHECK (refund_cents > 0),
  commission_reversal_cents BIGINT NOT NULL CHECK (commission_reversal_cents >= 0),
  merchant_refund_cents BIGINT NOT NULL CHECK (merchant_refund_cents >= 0),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (commission_reversal_cents + merchant_refund_cents = refund_cents)
);

CREATE INDEX IF NOT EXISTS purchase_refunds_purchase_idx
  ON purchase_refunds (purchase_id, created_at DESC);

COMMIT;

-- Required service rules:
-- 1. Never mark a purchase paid from a browser redirect alone; verify signed provider
--    webhook events or query the provider server-to-server.
-- 2. In one SQL transaction, validate provider event/idempotency, persist purchase,
--    and record commission accrual only after payment confirmation.
-- 3. Use row locks to enforce cumulative refunds <= the paid amount.
-- 4. Reconcile purchase/refund rows against provider settlement reports.
-- 5. The merchant agreement must specify whether the 2% is inclusive/exclusive of tax,
--    when it is charged, and how chargebacks/refunds affect the commission.
-- 6. These tables record an accounting split; they do not move funds or settle merchants.
