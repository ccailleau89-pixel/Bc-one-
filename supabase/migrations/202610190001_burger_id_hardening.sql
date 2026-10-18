-- Burger ID hardening — 19 October 2026.
-- Apply after 202610160002_bc_one_welcome_test_credits.sql, in the intended Supabase project, after review.
--
-- 1. Welcome test credits are granted only once the e-mail address is confirmed,
--    so unconfirmed sign-ups can no longer farm credits.
-- 2. The pseudo entered at sign-up is copied into burger_id_profiles.display_name
--    (trimmed, max 40 characters, 'Membre' when missing).
-- 3. Demo ledger amounts are signed: credits > 0, debits < 0.
-- 4. A signed-in member can delete their own Burger ID (right to erasure).
--    Every profile and ledger row references auth.users ON DELETE CASCADE.
--
-- Credits remain internal, non-transferable test credits with no monetary value.
-- Accounts that already received credits under 202610160002 before confirming
-- their e-mail keep them; review those rows manually if needed.

begin;

-- 3. Signed ledger amounts.
alter table public.bc_one_demo_ledger
  drop constraint if exists bc_one_demo_ledger_signed_amount;
alter table public.bc_one_demo_ledger
  add constraint bc_one_demo_ledger_signed_amount
  check ((entry_type = 'credit' and amount > 0) or (entry_type = 'debit' and amount < 0));

-- 1. Single server-side path that grants the welcome credits (idempotent).
create or replace function public.grant_bc_one_welcome_credits(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.bc_one_demo_ledger
    (user_id, amount, entry_type, reason, idempotency_key)
  values
    (target_user, 100, 'credit', 'welcome_bonus', 'welcome-v1:' || target_user::text)
  on conflict (idempotency_key) do nothing;
end;
$$;
revoke all on function public.grant_bc_one_welcome_credits(uuid) from public, anon, authenticated;

-- 1 + 2. New accounts: profiles with the sign-up pseudo; credits only if already confirmed
-- (for example when e-mail confirmation is disabled in the project settings).
create or replace function public.handle_new_burger_id_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.burger_id_profiles (user_id, display_name)
    values (
      new.id,
      coalesce(nullif(left(pg_catalog.btrim(new.raw_user_meta_data ->> 'name'), 40), ''), 'Membre')
    )
    on conflict (user_id) do nothing;
  insert into public.burger_crush_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.bc_one_member_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  if new.email_confirmed_at is not null then
    perform public.grant_bc_one_welcome_credits(new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_burger_id_user() from public, anon, authenticated;

-- 1. Grant the credits when the e-mail address becomes confirmed.
create or replace function public.handle_burger_id_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    perform public.grant_bc_one_welcome_credits(new.id);
  end if;
  return new;
end;
$$;
revoke all on function public.handle_burger_id_email_confirmed() from public, anon, authenticated;

drop trigger if exists on_auth_user_confirmed_burger_id on auth.users;
create trigger on_auth_user_confirmed_burger_id
after update of email_confirmed_at on auth.users
for each row execute function public.handle_burger_id_email_confirmed();

-- 4. Self-service account deletion. Only the authenticated caller's own account.
create or replace function public.delete_my_burger_id()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;
  delete from auth.users where id = caller;
end;
$$;
revoke all on function public.delete_my_burger_id() from public, anon, authenticated;
grant execute on function public.delete_my_burger_id() to authenticated;

commit;
