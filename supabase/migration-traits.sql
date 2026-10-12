-- ============================================================================
-- MIGRATION: Make traits editable. Run this ONCE in Supabase's SQL Editor.
-- Adds a traits table with the 8 current traits already filled in.
-- Doesn't touch your creatures, plushies, or comments.
-- ============================================================================

create table if not exists traits (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null check (category in ('Combat', 'Recovery', 'Mobility')),
  effect text not null,
  sort_order integer not null default 0
);

alter table traits enable row level security;

drop policy if exists "Traits are viewable by everyone" on traits;
create policy "Traits are viewable by everyone"
  on traits for select
  using (true);

-- Tables made in the SQL editor need these permissions spelled out.
grant select on traits to anon, authenticated;
grant all on traits to service_role;

insert into traits (name, category, effect, sort_order) values
  ('Bite', 'Combat', '+10% faster bite cooldown, letting you attack more often.', 1),
  ('Damage', 'Combat', '+5% attack damage.', 2),
  ('Weight', 'Combat', '+5% weight.', 3),
  ('Health', 'Recovery', '+12.5% health regeneration rate.', 4),
  ('Stamina Regen', 'Recovery', '+20% stamina regeneration, including in-glide stamina regeneration.', 5),
  ('Healing', 'Recovery', '+5% healing done to other creatures via Heal Breath or Heal Beam.', 6),
  ('Speed', 'Mobility', '+3.5% to walk, sprint, swim, and fly speed.', 7),
  ('Max Stamina', 'Mobility', '+15% total stamina.', 8)
on conflict (name) do nothing;

-- Also makes sure the server can use the passcode-attempts table, if you
-- created it earlier (harmless if you haven't).
do $$
begin
  if to_regclass('public.passcode_attempts') is not null then
    execute 'grant all on public.passcode_attempts to service_role';
  end if;
end $$;
