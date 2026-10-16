-- Burger ID shared identity with strict separation of BC ONE and Burger Crush data.
-- Apply only in the intended Supabase project after reviewing this migration.
-- Financial balances and game scores must never be writable by browser clients.

begin;

create table if not exists public.burger_id_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Membre' check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.burger_crush_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_score bigint not null default 0 check (total_score >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.bc_one_member_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.burger_id_profiles enable row level security;
alter table public.burger_crush_profiles enable row level security;
alter table public.bc_one_member_profiles enable row level security;

revoke all on table public.burger_id_profiles from anon, authenticated;
revoke all on table public.burger_crush_profiles from anon, authenticated;
revoke all on table public.bc_one_member_profiles from anon, authenticated;

grant select on table public.burger_id_profiles to authenticated;
grant update (display_name) on table public.burger_id_profiles to authenticated;
grant select on table public.burger_crush_profiles to authenticated;
grant select on table public.bc_one_member_profiles to authenticated;

drop policy if exists "read own Burger ID profile" on public.burger_id_profiles;
create policy "read own Burger ID profile"
  on public.burger_id_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "update own Burger ID display name" on public.burger_id_profiles;
create policy "update own Burger ID display name"
  on public.burger_id_profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "read own Burger Crush profile" on public.burger_crush_profiles;
create policy "read own Burger Crush profile"
  on public.burger_crush_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "read own BC ONE member profile" on public.bc_one_member_profiles;
create policy "read own BC ONE member profile"
  on public.bc_one_member_profiles for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_burger_id_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists burger_id_profiles_updated_at on public.burger_id_profiles;
create trigger burger_id_profiles_updated_at
before update on public.burger_id_profiles
for each row execute function public.set_burger_id_profile_updated_at();

create or replace function public.handle_new_burger_id_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.burger_id_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.burger_crush_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  insert into public.bc_one_member_profiles (user_id) values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_burger_id_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_burger_id on auth.users;
create trigger on_auth_user_created_burger_id
after insert on auth.users
for each row execute function public.handle_new_burger_id_user();

commit;
