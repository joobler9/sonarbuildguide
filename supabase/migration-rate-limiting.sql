-- ============================================================================
-- MIGRATION: Add passcode attempt rate limiting. Run this ONCE in
-- Supabase's SQL Editor. Doesn't touch any of your existing data.
-- ============================================================================

-- Tracks failed owner-passcode attempts, purely for rate limiting. Nothing
-- here is ever shown in the app, it's just a counter checked before each
-- passcode verification.
create table if not exists passcode_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists passcode_attempts_ip_idx on passcode_attempts(ip, attempted_at);

alter table passcode_attempts enable row level security;
-- No policies at all here on purpose: only the service role (used
-- server-side in the API routes) can read or write this table, the anon
-- key used by the browser has zero access to it either way.
