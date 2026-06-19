# CaratIQ

**Know if your diamond is real.** A premium diamond testing & verification
platform — photo screening, lab certification and mail-in testing — with a fast,
modern marketing site and a full content/admin dashboard.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**,
**Framer Motion** and **Supabase**.

---

## Features

- ⚡ **World-class marketing site** — animated hero, parallax aurora backgrounds,
  scroll-driven reveals, custom gradient scrollbar + scroll-progress bar, wavy
  section dividers, glassmorphism, fully responsive (mobile / tablet / desktop).
- 💬 Floating **WhatsApp** button (bottom-left) and **scroll-to-top with a circular
  progress ring** (bottom-right) on every page.
- 📝 **Blog / journal** with Markdown content, table of contents, related posts,
  share buttons — backed by Supabase, with bundled starter articles.
- 🧰 **Free tools** — carat-weight calculator, price estimator, and a real-vs-fake quiz.
- 🔐 **Admin dashboard at `/admin`** — custom email + password login (no public
  sign-up). Manage blog posts, media, messages, verification requests, site
  settings, analytics, and a secure **encrypted vault** for credentials.
- 🖼️ **WebP-everywhere pipeline** — every uploaded image (admin or visitor) is
  auto-converted to optimized WebP before storage; a local converter handles
  static assets.
- 🎨 **Single-source brand system** — the whole UI derives from the logo's palette
  (obsidian ink + cyan→indigo→violet gradient). Rebrand from `lib/site.ts`.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

The site runs and looks complete **with no configuration**. To enable the
database, admin dashboard and uploads, follow **[`ENV_SETUP.md`](./ENV_SETUP.md)**.

---

## Project structure

```
app/
  (site)/            Public website (inherits nav, footer, aurora, widgets)
    page.tsx         Home
    about, services, how-it-works, faq, verify, contact, blog, tools, ...
  admin/             Admin dashboard — login lives at /admin
  api/               Public + admin route handlers (forms, uploads, CRUD)
  layout.tsx         Root layout (fonts, providers)
components/
  ui/                Design-system primitives (button, card, input, ...)
  layout/            Navbar, Footer, AuroraBackground
  home/              Hero, DiamondVisual, Typewriter, dividers
  motion/            Reveal / Stagger / Parallax
  widgets/           ScrollProgress, FloatingWidgets (WhatsApp + to-top)
  brand/             Logo
lib/
  site.ts            Brand + contact config (edit to rebrand)
  content/           Marketing copy + seed blog posts
  blog.ts            Blog data layer (Supabase + local fallback)
  supabase/          Browser / server / service-role clients
  auth/              Session, credentials, gate (admin login)
  vault/             AES-256-GCM crypto for the vault
  image/             WebP conversion helper
supabase/schema.sql  One-shot database + storage setup
scripts/             convert-to-webp, seed-supabase
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build & serve |
| `npm run typecheck` | TypeScript check |
| `npm run images:webp` | Convert `assets-src/*` images → WebP in `public/` |
| `node scripts/seed-supabase.mjs` | Push starter blog posts into Supabase |

## Configuration & deployment

See **[`ENV_SETUP.md`](./ENV_SETUP.md)** for the full, step-by-step guide to keys,
the database, the admin login and deploying to Vercel.
