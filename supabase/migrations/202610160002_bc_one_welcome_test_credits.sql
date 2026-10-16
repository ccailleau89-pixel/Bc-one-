-- BC ONE welcome credits for new Burger ID registrations.
-- Internal, non-transferable test credits only; NOT ERC-20 tokens or crypto-assets.
-- Apply after 202610160001_burger_id_profiles.sql in the intended Supabase project.
begin;
create table if not exists public.bc_one_demo_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  entry_type text not null check (entry_type in ('credit', 'debit')),
  reason text not null check (reason in ('welcome_bonus')),
  idempotency_key text not null unique,
  created_at timestamptz not null default pg_catalog.now()
);
create index if not exists bc_one_demo_ledger_user_created_idx
  on public.bc_one_demo_ledger (user_id, created_at desc);
alter table public.bc_one_demo_ledger enable row level security;
revoke all on table public.bc_one_demo_ledger from anon, authenticated;
grant select on table public.bc_one_demo_ledger to authenticated;
drop policy if exists "read own BC ONE demo ledger" on public.bc_one_demo_ledger;
create policy "read own BC ONE demo ledger"
  on public.bc_one_demo_ledger for select to authenticated
  using ((select auth.uid()) = user_id);
create or replace function public.handle_new_burger_id_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.burger_id_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.burger_crush_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.bc_one_member_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.bc_one_demo_ledger
    (user_id, amount, entry_type, reason, idempotency_key)
  values
    (new.id, 100, 'credit', 'welcome_bonus', 'welcome-v1:' || new.id::text)
  on conflict (idempotency_key) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_burger_id_user() from public, anon, authenticated;
-- Existing users are intentionally not backfilled; only signups after migration get the bonus.
commit;
