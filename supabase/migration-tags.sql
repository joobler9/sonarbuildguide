-- ============================================================================
-- MIGRATION: Add tags (like META / UNDERRATED) to builds.
-- Run this ONCE in Supabase's SQL Editor. Doesn't change any existing data.
-- ============================================================================

alter table creatures add column if not exists tags text[] not null default '{}';
