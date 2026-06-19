# CaratIQ — Setup & Keys Guide

Everything you need to take CaratIQ from this folder to a live site. Follow the
steps top to bottom. You only edit **one file with secrets**: `.env.local`.

> The site is built so it **runs and looks complete even with empty keys** — the
> homepage, blog, tools and all pages work immediately. Supabase only unlocks the
> live database (admin dashboard, saved messages, uploads). Add keys when ready.

---

## 0. Run it locally first (optional, 1 minute)

```bash
npm install          # already done, but safe to re-run
npm run dev          # open http://localhost:3000
```

---

## 1. Supabase (database + file storage)

These three keys power the admin dashboard, blog database, contact messages,
verification requests, the media library and the vault.

1. Go to **https://supabase.com** → sign in → **New project**.
   - Give it a name (e.g. `caratiq`), set a database password (save it), pick a region.
2. Wait ~2 minutes for it to provision.
3. Open **Project Settings** (the gear icon, bottom-left) → **API**.
4. Copy these into `.env.local`:

   | Supabase screen | `.env.local` variable |
   |---|---|
   | **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
   | **Project API keys → `anon` `public`** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | **Project API keys → `service_role` `secret`** | `SUPABASE_SERVICE_ROLE_KEY` |

   ⚠️ The `service_role` key is all-powerful. It stays server-side only (it has no
   `NEXT_PUBLIC_` prefix, so it is never shipped to the browser). Never paste it
   into client code or commit it.

### 1a. Create the database tables

1. In Supabase, open **SQL Editor** → **New query**.
2. Open the file **`supabase/schema.sql`** from this project, copy ALL of it, paste,
   and click **Run**. This creates every table, security policy, and the public
   **`media`** storage bucket. It's safe to re-run.

### 1b. Confirm the storage bucket

- Go to **Storage**. You should see a public bucket named **`media`** (created by
  the SQL). All image uploads (blog covers, media library, verification photos)
  are auto-converted to **WebP** and stored here. If it's missing, create a new
  **public** bucket named `media`.

### 1c. Seed starter content (optional)

To push the 5 starter blog posts into the database:

```bash
node scripts/seed-supabase.mjs
```

(Needs the Supabase keys above already in `.env.local`. Without seeding, the same
posts still render from the bundled content.)

---

## 2. Secrets — session & vault

1. `SESSION_SECRET` signs the admin login cookie. `VAULT_SECRET` encrypts the
   passwords you store in the admin **Vault** (AES-256-GCM).
2. Generate a strong random string (32+ characters):
   - macOS/Linux/Git-Bash: `openssl rand -base64 32`
   - PowerShell: `[Convert]::ToBase64String((1..32 | % {Get-Random -Maximum 256}))`
3. Paste it into `SESSION_SECRET`. You can reuse a second one for `VAULT_SECRET`,
   or leave `VAULT_SECRET` blank to fall back to `SESSION_SECRET`.

> Keep these stable in production. If `SESSION_SECRET` changes, everyone is logged
> out. If `VAULT_SECRET` changes, previously stored vault passwords can't be decrypted.

---

## 3. Admin login (the `rootdomain/admin` portal)

The dashboard lives at **`/admin`** (e.g. `https://yoursite.com/admin`). It's an
email + password screen — no public sign-up.

- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` to whatever you want.
- **Default dev login** (if left as-is): `admin@caratiq.com` / `caratiq-admin`.
  **Change these before going live.**
- Optional hardening: store a hash instead of the plain password — set
  `ADMIN_PASSWORD_HASH` to the SHA-256 hex of your password and blank out
  `ADMIN_PASSWORD`. PowerShell one-liner:
  ```powershell
  (Get-FileHash -Algorithm SHA256 -InputStream ([IO.MemoryStream][Text.Encoding]::UTF8.GetBytes('YourPassword'))).Hash.ToLower()
  ```

---

## 4. Public site settings

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your live URL for SEO/share links. `http://localhost:3000` in dev. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | The number the floating WhatsApp button opens. International format, **digits only, no `+`, no spaces** (e.g. `8801712345678`). |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Public email shown in the footer & contact page. |

The brand name, address, phone, social links and nav live in **`lib/site.ts`** —
edit there to rebrand the whole site in one place.

---

## 5. AI diamond analyzer (instant photo test)

The **"Test my diamond"** tool reads an uploaded photo and returns an instant
authenticity verdict (real diamond vs. lab-grown vs. moissanite/CZ).

1. Go to **https://console.anthropic.com** → sign in.
2. Add credits/billing under **Billing** (pay-as-you-go).
3. **Settings → API Keys → Create Key**, copy the `sk-ant-…` value.
4. Paste it into `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
5. Optional: `ANTHROPIC_MODEL` (default `claude-sonnet-4-6`; switch to
   `claude-haiku-4-5-20251001` for cheaper/faster scans) and `ANALYZE_DAILY_LIMIT`
   (free scans per visitor per day — abuse guard, default 15).

Without this key the site still works — the analyzer just shows a friendly
"book a free expert review" message instead of an instant result. Scan results
are stored in the `analyses` table (created by `schema.sql`).

---

## 6. Images — WebP only

The project mandates WebP everywhere for speed.

- **Admin uploads** are converted to optimized WebP automatically (any JPG/PNG/HEIC
  you drop in becomes `.webp` before it's stored).
- **To add local images** to `public/`, drop the originals into `assets-src/` and run:
  ```bash
  npm run images:webp
  ```
  This writes optimized `.webp` copies into `public/` (see `scripts/convert-to-webp.mjs`).

---

## 7. Deploy (Vercel — recommended)

1. Push this repo to GitHub (your client will run the push).
2. Go to **https://vercel.com** → **Add New Project** → import the repo.
3. In **Settings → Environment Variables**, add **every variable** from your
   `.env.local` (same names, same values). Set `NEXT_PUBLIC_SITE_URL` to your real
   domain.
4. Deploy. Add your custom domain in **Settings → Domains**.

That's it. Visit `/admin`, log in, and start publishing.

---

### Quick checklist
- [ ] `npm run dev` works locally
- [ ] Supabase project created, 3 keys in `.env.local`
- [ ] `supabase/schema.sql` run in the SQL editor
- [ ] `media` storage bucket exists (public)
- [ ] `SESSION_SECRET` set (32+ chars)
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` set
- [ ] WhatsApp number + contact email set
- [ ] `ANTHROPIC_API_KEY` set (powers the instant "Test my diamond" analyzer)
- [ ] (optional) `node scripts/seed-supabase.mjs` run
- [ ] Deployed with env vars on Vercel
