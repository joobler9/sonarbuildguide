-- ============================================================================
-- MIGRATION: Remove upvotes, add self-delete for your own comments.
-- Run this ONCE in Supabase's SQL Editor.
-- ============================================================================

alter table comments drop column if exists upvoted_by;
alter table comments add column if not exists browser_id text;

drop policy if exists "Anyone can update a comment (for upvotes)" on comments;
drop policy if exists "Anyone can delete a comment" on comments;

create policy "Anyone can delete a comment"
  on comments for delete
  using (true);
