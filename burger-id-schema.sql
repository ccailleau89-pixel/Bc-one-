-- Burger ID — shared identity schema for Crush Burger and BC ONE
-- Run once in the SQL Editor of the SAME Supabase project used by both apps.
-- Never store passwords, private keys, wallet seed phrases, or service-role keys here.
create extension if not exists pgcrypto;

create table if not exists public.burger_id_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  city text not null default '' check (char_length(city) <= 80),
  burger_favorite text not null default '' check (char_length(burger_favorite) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.burger_id_profiles enable row level security;
drop policy if exists "Burger ID users read own profile" on public.burger_id_profiles;
create policy "Burger ID users read own profile" on public.burger_id_profiles
  for select to authenticated using (auth.uid() = id);
drop policy if exists "Burger ID users insert own profile" on public.burger_id_profiles;
create policy "Burger ID users insert own profile" on public.burger_id_profiles
  for insert to authenticated with check (auth.uid() = id);
drop policy if exists "Burger ID users update own profile" on public.burger_id_profiles;
create policy "Burger ID users update own profile" on public.burger_id_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.burger_id_handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.burger_id_profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_burger_id_user_created on auth.users;
create trigger on_burger_id_user_created
  after insert on auth.users
  for each row execute procedure public.burger_id_handle_new_user();

create index if not exists burger_id_profiles_updated_at_idx
  on public.burger_id_profiles(updated_at desc);
