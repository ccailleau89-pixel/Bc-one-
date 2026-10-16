-- One off-chain trial BCONE credit for every new Burger ID registration.
-- These units are demo/loyalty credits only: they are not ERC-20 tokens, are not
-- transferable, have no cash value, and must not be represented as crypto-assets.
begin;

alter table public.bc_one_member_profiles
  add column if not exists trial_tokens integer not null default 0
  check (trial_tokens >= 0);

create table if not exists public.bc_one_trial_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount = 1),
  reason text not null check (reason = 'signup_trial'),
  created_at timestamptz not null default pg_catalog.now(),
  unique (user_id, reason)
);

alter table public.bc_one_trial_ledger enable row level security;
revoke all on table public.bc_one_trial_ledger from anon, authenticated;

-- Existing accounts receive the one-time welcome trial credit during rollout.
insert into public.bc_one_member_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

with newly_granted as (
  insert into public.bc_one_trial_ledger (user_id, amount, reason)
  select u.id, 1, 'signup_trial'
  from auth.users u
  where not exists (
    select 1 from public.bc_one_trial_ledger l
    where l.user_id = u.id and l.reason = 'signup_trial'
  )
  on conflict (user_id, reason) do nothing
  returning user_id
)
update public.bc_one_member_profiles p
set trial_tokens = 1
from newly_granted g
where p.user_id = g.user_id;

create or replace function public.handle_new_burger_id_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.burger_id_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.burger_crush_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.bc_one_member_profiles (user_id, trial_tokens)
  values (new.id, 1)
  on conflict (user_id) do nothing;

  insert into public.bc_one_trial_ledger (user_id, amount, reason)
  values (new.id, 1, 'signup_trial')
  on conflict (user_id, reason) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_burger_id_user() from public, anon, authenticated;

-- Browser clients may read only their own balance. They cannot change it.
grant select on table public.bc_one_member_profiles to authenticated;

drop policy if exists "read own BC ONE member profile" on public.bc_one_member_profiles;
create policy "read own BC ONE member profile"
  on public.bc_one_member_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

commit;
