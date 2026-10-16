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

DO $$
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
END $$;

ROLLBACK;
