-- Kroger OAuth connections are server-only.
-- Client roles are explicitly revoked and RLS remains enabled.

create table if not exists public.kroger_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  expires_at timestamptz not null,
  scope text,
  environment text not null check (environment in ('certification','production')),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.kroger_oauth_states (
  id uuid primary key default gen_random_uuid(),
  state_hash text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  verifier_encrypted text not null,
  redirect_uri text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.kroger_connections enable row level security;
alter table public.kroger_oauth_states enable row level security;

revoke all on table public.kroger_connections from anon, authenticated;
revoke all on table public.kroger_oauth_states from anon, authenticated;

create index if not exists kroger_oauth_states_expires_at_idx
  on public.kroger_oauth_states (expires_at);
