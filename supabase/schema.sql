-- ============================================================================
-- CaratIQ — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: everything uses "if not exists" / "or replace".
-- ============================================================================

-- shared updated_at trigger -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ── BLOG ────────────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id            bigserial primary key,
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  content       text not null default '',          -- markdown
  cover_image   text,                               -- webp url
  author        text not null default 'CaratIQ Team',
  author_role   text default 'Gemologist',
  category      text default 'Guides',
  tags          text[] default '{}',
  status        text not null default 'draft',      -- draft | published
  featured      boolean not null default false,
  seo_title     text,
  seo_description text,
  read_minutes  int default 5,
  views         int not null default 0,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_blog_status   on public.blog_posts (status, published_at desc);
create index if not exists idx_blog_category on public.blog_posts (category);
drop trigger if exists trg_blog_updated on public.blog_posts;
create trigger trg_blog_updated before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ── EDITABLE PAGES (about, terms, privacy, …) ────────────────────────────────
create table if not exists public.pages (
  id            bigserial primary key,
  slug          text unique not null,
  title         text not null,
  content       text not null default '',
  status        text not null default 'published',
  seo_title     text,
  seo_description text,
  updated_at    timestamptz not null default now()
);
drop trigger if exists trg_pages_updated on public.pages;
create trigger trg_pages_updated before update on public.pages
  for each row execute function public.set_updated_at();

-- ── MEDIA LIBRARY (webp only) ────────────────────────────────────────────────
create table if not exists public.media (
  id          bigserial primary key,
  filename    text not null,
  url         text not null,
  alt         text default '',
  width       int,
  height      int,
  bytes       int,
  created_at  timestamptz not null default now()
);
create index if not exists idx_media_created on public.media (created_at desc);

-- ── CONTACT MESSAGES ─────────────────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      text not null default 'new',          -- new | read | replied | archived
  created_at  timestamptz not null default now()
);
create index if not exists idx_contact_created on public.contact_submissions (created_at desc);

-- ── DIAMOND TEST / VERIFICATION REQUESTS ─────────────────────────────────────
create table if not exists public.test_requests (
  id          bigserial primary key,
  name        text not null,
  email       text not null,
  phone       text,
  method      text not null default 'photo',        -- photo | lab | mail-in
  carat       text,
  details     text,
  image_url   text,                                 -- webp upload
  status      text not null default 'new',          -- new | in-review | completed
  result      text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_test_created on public.test_requests (created_at desc);

-- ── NEWSLETTER ───────────────────────────────────────────────────────────────
create table if not exists public.subscribers (
  id          bigserial primary key,
  email       text unique not null,
  created_at  timestamptz not null default now()
);

-- ── SITE SETTINGS (theme, footer, menus, header scripts, homepage) ───────────
create table if not exists public.site_settings (
  key         text primary key,
  value       jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_settings_updated on public.site_settings;
create trigger trg_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ── SIMPLE ANALYTICS ─────────────────────────────────────────────────────────
create table if not exists public.page_views (
  id          bigserial primary key,
  path        text not null,
  referrer    text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_views_created on public.page_views (created_at desc);
create index if not exists idx_views_path    on public.page_views (path);

-- ── AI ANALYZER RESULTS (instant image-based diamond tests) ──────────────────
create table if not exists public.analyses (
  id          bigserial primary key,
  image_url   text,                                 -- stored webp
  image_hash  text,                                 -- for caching identical uploads
  verdict     text,                                 -- short verdict label
  score       int,                                  -- authenticity score 0-100
  result      jsonb not null default '{}'::jsonb,   -- full structured analysis
  ip_address  text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_analyses_created on public.analyses (created_at desc);
create index if not exists idx_analyses_hash    on public.analyses (image_hash);

-- ── SECURE VAULT (AES-256-GCM, service-role only) ────────────────────────────
create table if not exists public.vault_credentials (
  id                 bigserial primary key,
  site_name          text not null,
  site_url           text,
  username           text,
  password_encrypted text not null,                 -- base64(iv||tag||ciphertext)
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists idx_vault_name on public.vault_credentials (site_name);
drop trigger if exists trg_vault_updated on public.vault_credentials;
create trigger trg_vault_updated before update on public.vault_credentials
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- The admin dashboard talks to Supabase with the SERVICE ROLE key, which
-- bypasses RLS. Public visitors use the ANON key, so we only open the minimum.
-- ============================================================================
alter table public.blog_posts          enable row level security;
alter table public.pages               enable row level security;
alter table public.media               enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.test_requests       enable row level security;
alter table public.subscribers         enable row level security;
alter table public.site_settings       enable row level security;
alter table public.page_views          enable row level security;
alter table public.analyses            enable row level security;
alter table public.vault_credentials   enable row level security;

-- public can read published content
drop policy if exists "read published posts" on public.blog_posts;
create policy "read published posts" on public.blog_posts
  for select using (status = 'published');

drop policy if exists "read published pages" on public.pages;
create policy "read published pages" on public.pages
  for select using (status = 'published');

drop policy if exists "read settings" on public.site_settings;
create policy "read settings" on public.site_settings
  for select using (true);

-- public can submit forms (insert only)
drop policy if exists "insert contact" on public.contact_submissions;
create policy "insert contact" on public.contact_submissions
  for insert with check (true);

drop policy if exists "insert test" on public.test_requests;
create policy "insert test" on public.test_requests
  for insert with check (true);

drop policy if exists "insert subscriber" on public.subscribers;
create policy "insert subscriber" on public.subscribers
  for insert with check (true);

drop policy if exists "insert view" on public.page_views;
create policy "insert view" on public.page_views
  for insert with check (true);

-- vault_credentials: NO policies → default deny for anon/authenticated.
-- Only the service role (admin API) can touch it.

-- ============================================================================
-- STORAGE: create a public bucket named "media" in Dashboard → Storage,
-- or run:  insert into storage.buckets (id, name, public) values ('media','media',true)
--          on conflict (id) do nothing;
-- All uploads are converted to .webp before they land here.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public read media" on storage.objects;
create policy "public read media" on storage.objects
  for select using (bucket_id = 'media');
