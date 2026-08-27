-- ============================================================================
-- MIGRATION: Remove real accounts and follows, switch to a simple owner
-- passcode for editing. Run this ONCE in Supabase's SQL Editor.
-- Your existing creatures and plushies data is untouched by this.
-- ============================================================================

-- Remove follows entirely.
drop table if exists follows cascade;

-- Drop every existing RLS policy on these tables so we can replace them
-- cleanly with the new, accounts-free rules below. This has to happen
-- BEFORE touching user_id, since two of these policies depend on it.
drop policy if exists "Comments are viewable by everyone" on comments;
drop policy if exists "Logged in users can post comments" on comments;
drop policy if exists "Users can update their own comment (for upvotes on any comment)" on comments;
drop policy if exists "Authors and moderators can delete comments" on comments;

-- Comments no longer need a real logged-in account. Replace the user_id
-- link with a plain typed display name, and switch upvotes to track a
-- random per-browser id instead of a real user id.
alter table comments drop column if exists user_id;
alter table comments add column if not exists username text not null default 'Anonymous';
alter table comments alter column username drop default;

create policy "Comments are viewable by everyone"
  on comments for select
  using (true);

create policy "Anyone can post a comment"
  on comments for insert
  with check (true);

create policy "Anyone can update a comment (for upvotes)"
  on comments for update
  using (true);

-- Comment deletion now only ever happens through the passcode-verified
-- server route (using the service role key), which bypasses RLS entirely.
-- So regular visitors get no delete policy at all here.

-- Creatures and plushies: same idea, only the passcode-verified server
-- route (service role) can add/edit/delete now, not any logged-in role.
drop policy if exists "Only moderators and admins can add creatures" on creatures;
drop policy if exists "Only moderators and admins can edit creatures" on creatures;
drop policy if exists "Only moderators and admins can delete creatures" on creatures;
drop policy if exists "Only moderators and admins can add plushies" on plushies;
drop policy if exists "Only moderators and admins can edit plushies" on plushies;
drop policy if exists "Only moderators and admins can delete plushies" on plushies;

-- Everyone can still view creatures/plushies (existing "viewable by
-- everyone" select policies on both tables are untouched and still apply).

-- Profiles and their auto-creation trigger are no longer needed at all.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();
drop table if exists profiles cascade;
drop function if exists is_moderator_or_admin();
drop function if exists is_admin();

-- ============================================================================
-- After running this, set your real owner passcode as an environment
-- variable in Vercel (Settings > Environment Variables):
--
--   OWNER_PASSCODE = something-only-you-know
--
-- Then redeploy. See the README for how the passcode is actually used.
-- ============================================================================
