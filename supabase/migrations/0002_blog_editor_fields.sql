-- ── Blog editor: full-page rich editor fields ──────────────────────────────
-- Run this in your Supabase project (SQL Editor) to upgrade an existing
-- blog_posts table with the new editor fields. Safe to run more than once.

alter table public.blog_posts
  add column if not exists content_format text not null default 'markdown',  -- 'html' | 'markdown'
  add column if not exists layout         text not null default 'with-sidebar', -- 'with-sidebar' | 'full-page'
  add column if not exists difficulty     text default 'Beginner',            -- Beginner | Intermediate | Expert
  add column if not exists topic_focus    text default 'Natural',             -- Natural | Lab-grown | Buying | Care | 4Cs
  add column if not exists custom_css     text,                               -- per-page CSS, injected after global CSS
  add column if not exists custom_schema  text;                               -- per-page JSON-LD, replaces default schema
