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
  CHECK (commission_cents = floor((gross_cents::numeric * commission_bps) / 10000)::bigint),
  CHECK ((status IN ('paid', 'partially_refunded', 'refunded') AND paid_at IS NOT NULL) OR status NOT IN ('paid', 'partially_refunded', 'refunded'))
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (entry_type = 'commission_accrual' AND amount_cents > 0) OR
    (entry_type = 'commission_reversal' AND amount_cents < 0) OR
    (entry_type = 'manual_adjustment' AND amount_cents <> 0)
  )
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

-- Prevent refund totals from exceeding the original paid purchase, even when requests race.
CREATE OR REPLACE FUNCTION bc_one_guard_refund_totals()
RETURNS trigger LANGUAGE plpgsql AS $bc_one$bc_one$
DECLARE
  purchase_gross BIGINT;
  purchase_commission BIGINT;
  other_refunds BIGINT;
  other_commission_reversals BIGINT;
BEGIN
  SELECT gross_cents, commission_cents
    INTO purchase_gross, purchase_commission
    FROM partner_purchases
    WHERE id = NEW.purchase_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'purchase_not_found' USING ERRCODE = '23503';
  END IF;

  SELECT COALESCE(SUM(refund_cents), 0),
         COALESCE(SUM(commission_reversal_cents), 0)
    INTO other_refunds, other_commission_reversals
    FROM purchase_refunds
    WHERE purchase_id = NEW.purchase_id
      AND status IN ('pending', 'succeeded')
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF NEW.status IN ('pending', 'succeeded') THEN
    IF other_refunds + NEW.refund_cents > purchase_gross THEN
      RAISE EXCEPTION 'refund_total_exceeds_purchase' USING ERRCODE = '23514';
    END IF;
    IF other_commission_reversals + NEW.commission_reversal_cents > purchase_commission THEN
      RAISE EXCEPTION 'commission_reversal_exceeds_commission' USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$bc_one$bc_one$;

DROP TRIGGER IF EXISTS bc_one_refund_totals_guard ON purchase_refunds;
CREATE TRIGGER bc_one_refund_totals_guard
BEFORE INSERT OR UPDATE ON purchase_refunds
FOR EACH ROW EXECUTE FUNCTION bc_one_guard_refund_totals();

-- Commission history is append-only: corrections must be compensating entries.
CREATE OR REPLACE FUNCTION bc_one_reject_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql AS $bc_one$
BEGIN
  RAISE EXCEPTION 'ledger_entries_are_append_only' USING ERRCODE = '55000';
END;
$bc_one$;

DROP TRIGGER IF EXISTS bc_one_commission_ledger_immutable ON purchase_commission_entries;
CREATE TRIGGER bc_one_commission_ledger_immutable
BEFORE UPDATE OR DELETE ON purchase_commission_entries
FOR EACH ROW EXECUTE FUNCTION bc_one_reject_ledger_mutation();

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
