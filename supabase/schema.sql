-- ============================================================================
-- Sonaria Build Guide — Database Schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================================

-- PROFILES ------------------------------------------------------------------
-- Extends Supabase's built-in auth.users with public profile data + role.
-- role: 'user' (default) | 'moderator' | 'admin'
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever someone signs up.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Helper: is the current user a moderator or admin?
create or replace function is_moderator_or_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$ language sql security definer stable;

-- Helper: is the current user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;


-- CREATURES ---------------------------------------------------------------
-- Creatures now live fully in the database (not shipped as static app data),
-- the same as plushies, so moderators and admins can add brand new ones
-- when the game releases them, not just edit the ones already here.
create table if not exists creatures (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  flavor text not null,
  category text not null check (category in ('Land', 'Sea', 'Sky')),
  diet text not null,
  playstyle text not null,
  elder text not null check (elder in ('Powerful', 'Gentle', 'Devious')),
  tier text not null check (tier in ('1', '2', '3', '4', '5')),
  health integer not null,
  damage integer not null,
  weight integer not null,
  stamina integer not null,
  speed_text text not null,
  best_traits text[] not null default '{}',
  recommended_plushies text[] not null default '{}',
  notes text not null default '',
  added_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creatures_name_idx on creatures(name);

alter table creatures enable row level security;

create policy "Creatures are viewable by everyone"
  on creatures for select
  using (true);

create policy "Only moderators and admins can add creatures"
  on creatures for insert
  with check (is_moderator_or_admin());

create policy "Only moderators and admins can edit creatures"
  on creatures for update
  using (is_moderator_or_admin());

create policy "Only moderators and admins can delete creatures"
  on creatures for delete
  using (is_moderator_or_admin());


-- PLUSHIES --------------------------------------------------------------------
-- Unlike creatures (which stay as static data in the app, with only edits
-- stored in the database), plushies live fully in the database so that
-- moderators and admins can add brand new ones, not just edit existing ones.
create table if not exists plushies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('Boost', 'Ailments', 'Ability Grant', 'Mutation Chance')),
  effect text not null,
  availability text not null,
  added_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table plushies enable row level security;

create policy "Plushies are viewable by everyone"
  on plushies for select
  using (true);

create policy "Only moderators and admins can add plushies"
  on plushies for insert
  with check (is_moderator_or_admin());

create policy "Only moderators and admins can edit plushies"
  on plushies for update
  using (is_moderator_or_admin());

create policy "Only moderators and admins can delete plushies"
  on plushies for delete
  using (is_moderator_or_admin());


-- COMMENTS --------------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  creature_id uuid not null references creatures(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  text text not null check (char_length(text) between 1 and 500),
  upvoted_by uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists comments_creature_id_idx on comments(creature_id);

alter table comments enable row level security;

create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Logged in users can post comments"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own comment (for upvotes on any comment)"
  on comments for update
  using (true);

-- Both the comment's own author AND moderators/admins can delete it.
create policy "Authors and moderators can delete comments"
  on comments for delete
  using (auth.uid() = user_id or is_moderator_or_admin());


-- FOLLOWS -----------------------------------------------------------------
create table if not exists follows (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

alter table follows enable row level security;

create policy "Follows are viewable by everyone"
  on follows for select
  using (true);

create policy "Users can manage their own follows"
  on follows for all
  using (auth.uid() = follower_id);


-- ============================================================================
-- After running this, promote yourself to admin once you've signed up:
--
--   update profiles set role = 'admin' where username = 'your-username';
--
-- Promote a trusted user to moderator the same way:
--
--   update profiles set role = 'moderator' where username = 'their-username';
-- ============================================================================
