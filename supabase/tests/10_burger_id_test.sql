-- TEST ONLY. Run after 00_supabase_auth_shim.sql and every migration, as a superuser.
-- Each failed expectation raises an exception (run psql with ON_ERROR_STOP=1).

\set ON_ERROR_STOP 1

create or replace function pg_temp.expect(ok boolean, label text) returns void
language plpgsql as $$
begin
  if not coalesce(ok, false) then
    raise exception 'TEST FAILED: %', label;
  end if;
  raise notice 'ok - %', label;
end;
$$;

-- Fixed test accounts.
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-00000000000a', 'a@example.test', '{"name": "  Léa  "}'),
  ('00000000-0000-4000-8000-00000000000c', 'c@example.test', '{}');
insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
  ('00000000-0000-4000-8000-00000000000b', 'b@example.test', now(),
   jsonb_build_object('name', repeat('x', 60)));

-- Sign-up: profiles and pseudo.
select pg_temp.expect(
  (select display_name from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000a') = 'Léa',
  'sign-up pseudo is trimmed and stored');
select pg_temp.expect(
  (select char_length(display_name) from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000b') = 40,
  'long sign-up pseudo is cut to 40 characters');
select pg_temp.expect(
  (select display_name from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000c') = 'Membre',
  'missing pseudo falls back to Membre');
select pg_temp.expect(
  (select count(*) from public.burger_crush_profiles) = 3 and (select count(*) from public.bc_one_member_profiles) = 3,
  'Crush and BC ONE profiles are created for every account');

-- Welcome credits only after e-mail confirmation, exactly once.
select pg_temp.expect(
  (select count(*) from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000a') = 0,
  'unconfirmed account receives no welcome credits');
select pg_temp.expect(
  (select sum(amount) from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000b') = 100,
  'account confirmed at sign-up receives 100 credits');
update auth.users set email_confirmed_at = now() where id = '00000000-0000-4000-8000-00000000000a';
select pg_temp.expect(
  (select sum(amount) from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000a') = 100,
  'confirming the e-mail grants 100 credits');
update auth.users set email_confirmed_at = now() + interval '1 minute' where id = '00000000-0000-4000-8000-00000000000a';
update auth.users set email_confirmed_at = null where id = '00000000-0000-4000-8000-00000000000a';
update auth.users set email_confirmed_at = now() where id = '00000000-0000-4000-8000-00000000000a';
select pg_temp.expect(
  (select count(*) from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000a') = 1,
  'repeated confirmations never grant credits twice');

-- Ledger sign constraint.
do $$
begin
  insert into public.bc_one_demo_ledger (user_id, amount, entry_type, reason, idempotency_key)
  values ('00000000-0000-4000-8000-00000000000b', 50, 'debit', 'welcome_bonus', 'test-positive-debit');
  raise exception 'TEST FAILED: positive debit was accepted';
exception when check_violation then
  raise notice 'ok - positive debit is rejected';
end;
$$;

-- Browser role isolation (RLS) for member A.
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', false);

select pg_temp.expect((select count(*) from public.burger_id_profiles) = 1, 'A reads only its own Burger ID profile');
select pg_temp.expect((select count(*) from public.bc_one_demo_ledger) = 1, 'A reads only its own ledger rows');
select pg_temp.expect((select count(*) from public.burger_crush_profiles) = 1, 'A reads only its own Crush profile');

update public.burger_id_profiles set display_name = 'Léa M.' where user_id = '00000000-0000-4000-8000-00000000000a';
update public.burger_id_profiles set display_name = 'pirate' where user_id = '00000000-0000-4000-8000-00000000000b';
reset role;
select pg_temp.expect(
  (select display_name from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000a') = 'Léa M.',
  'A can rename its own profile');
select pg_temp.expect(
  (select display_name from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000b') <> 'pirate',
  'A cannot rename another member');

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', false);
do $$
declare
  statements text[] := array[
    $q$insert into public.bc_one_demo_ledger (user_id, amount, entry_type, reason, idempotency_key)
       values ('00000000-0000-4000-8000-00000000000a', 1000, 'credit', 'welcome_bonus', 'forged')$q$,
    $q$update public.bc_one_demo_ledger set amount = 1000000$q$,
    $q$delete from public.bc_one_demo_ledger$q$,
    $q$update public.burger_crush_profiles set total_score = 999999$q$,
    $q$select public.grant_bc_one_welcome_credits('00000000-0000-4000-8000-00000000000a')$q$
  ];
  s text;
begin
  foreach s in array statements loop
    begin
      execute s;
      raise exception 'TEST FAILED: browser role was allowed: %', s;
    exception when insufficient_privilege then
      raise notice 'ok - browser role is refused: %', left(regexp_replace(s, '\s+', ' ', 'g'), 60);
    end;
  end loop;
end;
$$;
reset role;

-- Trigger and credit functions are not callable by browser roles.
select pg_temp.expect(
  not has_function_privilege(r, f, 'execute'),
  format('%s cannot execute %s', r, f))
from unnest(array['anon', 'authenticated']) as r,
     unnest(array['public.handle_new_burger_id_user()',
                  'public.handle_burger_id_email_confirmed()',
                  'public.grant_bc_one_welcome_credits(uuid)']) as f;
select pg_temp.expect(has_function_privilege('authenticated', 'public.delete_my_burger_id()', 'execute'),
  'authenticated members can call delete_my_burger_id');

-- Anonymous visitors read nothing.
set role anon;
do $$
begin
  perform count(*) from public.burger_id_profiles;
  raise exception 'TEST FAILED: anon can read profiles';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot read profiles';
end;
$$;
do $$
begin
  perform public.delete_my_burger_id();
  raise exception 'TEST FAILED: anon can call delete_my_burger_id';
exception when insufficient_privilege then
  raise notice 'ok - anon cannot delete accounts';
end;
$$;
reset role;

-- Account deletion: authenticated without a subject is refused.
set role authenticated;
select set_config('request.jwt.claim.sub', '', false);
do $$
begin
  perform public.delete_my_burger_id();
  raise exception 'TEST FAILED: deletion without a session was accepted';
exception when insufficient_privilege then
  raise notice 'ok - deletion requires a signed-in member';
end;
$$;

-- A deletes its own account; B is untouched.
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', false);
select public.delete_my_burger_id();
reset role;
select pg_temp.expect(
  not exists (select 1 from auth.users where id = '00000000-0000-4000-8000-00000000000a')
  and not exists (select 1 from public.burger_id_profiles where user_id = '00000000-0000-4000-8000-00000000000a')
  and not exists (select 1 from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000a')
  and not exists (select 1 from public.burger_crush_profiles where user_id = '00000000-0000-4000-8000-00000000000a'),
  'deleting A removes its account, profiles and ledger');
select pg_temp.expect(
  exists (select 1 from auth.users where id = '00000000-0000-4000-8000-00000000000b')
  and (select sum(amount) from public.bc_one_demo_ledger where user_id = '00000000-0000-4000-8000-00000000000b') = 100,
  'deleting A leaves B intact');

\echo 'Burger ID migration tests passed'
