create extension if not exists citext;
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.waitlist_leads (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text not null default 'website',
  page text,
  completed_puzzle_id text,
  referrer text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_waitlist_leads_updated_at on public.waitlist_leads;
create trigger set_waitlist_leads_updated_at
before update on public.waitlist_leads
for each row execute function public.set_updated_at();

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email citext unique,
  display_name text not null default 'Color Maker',
  avatar text not null default 'core',
  stripe_customer_id text unique,
  subscription_status text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.puzzle_completions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  puzzle_id text not null,
  plays integer not null default 0,
  best_time_ms integer,
  last_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(profile_id, puzzle_id)
);

drop trigger if exists set_puzzle_completions_updated_at on public.puzzle_completions;
create trigger set_puzzle_completions_updated_at
before update on public.puzzle_completions
for each row execute function public.set_updated_at();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

create table if not exists public.puzzle_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  anonymous_id text,
  session_id text,
  event_type text not null,
  puzzle_id text,
  category text,
  difficulty text,
  tier text,
  source text not null default 'app',
  metadata jsonb not null default '{}'::jsonb,
  user_agent text,
  referrer text,
  created_at timestamptz not null default now()
);

create index if not exists puzzle_events_created_at_idx on public.puzzle_events (created_at desc);
create index if not exists puzzle_events_event_type_idx on public.puzzle_events (event_type);
create index if not exists puzzle_events_puzzle_id_idx on public.puzzle_events (puzzle_id);
create index if not exists puzzle_events_profile_id_idx on public.puzzle_events (profile_id);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email citext not null unique,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.waitlist_leads enable row level security;
alter table public.profiles enable row level security;
alter table public.puzzle_completions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.puzzle_events enable row level security;
alter table public.admin_users enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant all privileges on table public.waitlist_leads to service_role;
grant all privileges on table public.profiles to service_role;
grant all privileges on table public.puzzle_completions to service_role;
grant all privileges on table public.subscriptions to service_role;
grant all privileges on table public.puzzle_events to service_role;
grant all privileges on table public.admin_users to service_role;
revoke insert, update on table public.profiles from authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, avatar) on table public.profiles to authenticated;
grant select, insert, update, delete on table public.puzzle_completions to authenticated;
grant select on table public.subscriptions to authenticated;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles
for select
using (auth.uid() = auth_user_id);

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles
for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "Completions are readable by profile owner" on public.puzzle_completions;
create policy "Completions are readable by profile owner"
on public.puzzle_completions
for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = puzzle_completions.profile_id
      and profiles.auth_user_id = auth.uid()
  )
);

drop policy if exists "Completions are editable by profile owner" on public.puzzle_completions;
create policy "Completions are editable by profile owner"
on public.puzzle_completions
for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = puzzle_completions.profile_id
      and profiles.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = puzzle_completions.profile_id
      and profiles.auth_user_id = auth.uid()
  )
);
