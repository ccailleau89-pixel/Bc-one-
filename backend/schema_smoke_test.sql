-- Smoke tests for backend/schema.sql. Runs inside a transaction and rolls back.
BEGIN;

INSERT INTO members (id, email_normalized, display_name, status)
VALUES ('00000000-0000-4000-8000-000000000001', 'demo@example.invalid', 'Demo Member', 'active');

INSERT INTO benefits (id, slug, title, points_cost, status)
VALUES ('00000000-0000-4000-8000-000000000002', 'demo-benefit', 'Demo benefit', 10, 'active');

INSERT INTO ledger_entries
  (id, member_id, amount, entry_type, idempotency_key, reason)
VALUES
  ('00000000-0000-4000-8000-000000000003',
   '00000000-0000-4000-8000-000000000001', 50, 'welcome_credit', 'smoke-key-1', 'Smoke test credit');

INSERT INTO merchants
  (id, legal_name, public_name, status, commission_bps)
VALUES
  ('00000000-0000-4000-8000-000000000010', 'Demo Merchant SARL', 'Demo Shop', 'active', 200);

INSERT INTO partner_purchases
  (id, merchant_id, member_id, gross_cents, commission_bps, commission_cents,
   merchant_net_cents, payment_provider, provider_payment_id, idempotency_key, status, paid_at)
VALUES
  ('00000000-0000-4000-8000-000000000011',
   '00000000-0000-4000-8000-000000000010',
   '00000000-0000-4000-8000-000000000001',
   10000, 200, 200, 9800, 'test-provider', 'test-payment-1', 'purchase-key-1',
   'paid', now());

INSERT INTO purchase_commission_entries
  (id, purchase_id, entry_type, amount_cents, idempotency_key, reason)
VALUES
  ('00000000-0000-4000-8000-000000000012',
   '00000000-0000-4000-8000-000000000011',
   'commission_accrual', 200, 'commission-key-1', 'Smoke test 2% commission');

DO $
BEGIN
  BEGIN
    INSERT INTO ledger_entries
      (id, member_id, amount, entry_type, idempotency_key, reason)
    VALUES
      ('00000000-0000-4000-8000-000000000004',
       '00000000-0000-4000-8000-000000000001', 10, 'earned_credit', 'smoke-key-1', 'Duplicate key should fail');
    RAISE EXCEPTION 'Expected duplicate idempotency key to fail';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'PASS: duplicate ledger idempotency key rejected';
  END;

  BEGIN
    INSERT INTO benefits (id, slug, title, points_cost, status)
    VALUES ('00000000-0000-4000-8000-000000000005', 'invalid-benefit', 'Invalid', 0, 'active');
    RAISE EXCEPTION 'Expected non-positive benefit cost to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: non-positive benefit cost rejected';
  END;

  BEGIN
    INSERT INTO ledger_entries
      (id, member_id, amount, entry_type, idempotency_key, reason)
    VALUES
      ('00000000-0000-4000-8000-000000000006',
       '00000000-0000-4000-8000-000000000001', 0, 'earned_credit', 'smoke-key-zero', 'Zero amount should fail');
    RAISE EXCEPTION 'Expected zero ledger amount to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: zero ledger amount rejected';
  END;
  BEGIN
    INSERT INTO partner_purchases
      (id, merchant_id, gross_cents, commission_bps, commission_cents, merchant_net_cents,
       payment_provider, provider_payment_id, idempotency_key, status)
    VALUES
      ('00000000-0000-4000-8000-000000000013',
       '00000000-0000-4000-8000-000000000010', 10000, 200, 201, 9800,
       'test-provider', 'test-payment-2', 'purchase-key-invalid', 'pending');
    RAISE EXCEPTION 'Expected invalid purchase split to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: inconsistent commission split rejected';
  END;

  BEGIN
    INSERT INTO partner_purchases
      (id, merchant_id, gross_cents, commission_bps, commission_cents, merchant_net_cents,
       payment_provider, provider_payment_id, idempotency_key, status)
    VALUES
      ('00000000-0000-4000-8000-000000000015',
       '00000000-0000-4000-8000-000000000010', 10000, 200, 201, 9799,
       'test-provider', 'test-payment-wrong-rate', 'purchase-key-wrong-rate', 'pending');
    RAISE EXCEPTION 'Expected commission formula mismatch to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: commission formula mismatch rejected';
  END;

  BEGIN
    INSERT INTO purchase_refunds
      (id, purchase_id, provider_refund_id, refund_cents, commission_reversal_cents,
       merchant_refund_cents, idempotency_key, status)
    VALUES
      ('00000000-0000-4000-8000-000000000021',
       '00000000-0000-4000-8000-000000000011',
       'test-refund-too-large', 8000, 160, 7840, 'refund-key-too-large', 'pending');
    RAISE EXCEPTION 'Expected cumulative refund limit to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: cumulative refund cap enforced';
  END;

  BEGIN
    UPDATE purchase_commission_entries
      SET reason = 'tampered'
      WHERE id = '00000000-0000-4000-8000-000000000012';
    RAISE EXCEPTION 'Expected immutable commission ledger to reject update';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    RAISE NOTICE 'PASS: commission ledger is append-only';
  END;

  BEGIN
    INSERT INTO merchants (id, legal_name, public_name, commission_bps)
    VALUES ('00000000-0000-4000-8000-000000000014', 'Invalid SARL', 'Invalid', 10001);
    RAISE EXCEPTION 'Expected invalid commission rate to fail';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PASS: invalid commission rate rejected';
  END;
END $;

ROLLBACK;
