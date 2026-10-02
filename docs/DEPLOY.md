# Deploying

The site is plain static files. `npm run build` writes everything to `dist/`, and any static host can serve that folder. GitHub stays the source of truth; the host builds from it.

Build settings, for any host:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 or newer (22 recommended) |
| `SITE_URL` | the public origin, e.g. `https://johnbrittain.com` (used for canonical URLs, social previews, sitemap) |
| `BASE_PATH` | `/` normally; `/resume-website/` only for `github.io` project pages |

---

## Option A: GitHub Pages (current host)

The old site was served straight from the branch root. The new one needs a build step, so Pages must deploy via GitHub Actions. The workflow is already in `.github/workflows/deploy-pages.yml`.

This work is on the `redesign` branch, which starts from `origin/main`, so it merges cleanly. **Do step 1 before merging it into `main`.** Otherwise Pages will serve the raw repository (there's no `index.html` at the root any more) until the setting changes.

1. GitHub → repository → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Merge to `main` (or run the workflow by hand: **Actions → Deploy to GitHub Pages → Run workflow**).
3. The site appears at `https://johnbrittaein.github.io/resume-website/`.

The workflow sets `BASE_PATH=/resume-website/` and `SITE_URL=https://johnbrittaein.github.io`, runs `npm run check`, and caches processed images between runs.

---

## Option B: Cloudflare Pages (recommended for the custom domain)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**, and pick `JohnBrittaein/resume-website`.
2. Build settings:
   - Framework preset: **None**
   - Production branch: `main`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variables (Production):
   - `NODE_VERSION` = `22`
   - `SITE_URL` = `https://johnbrittain.com` (use the `*.pages.dev` URL until the domain is connected)
4. Save and deploy. Every push to `main` redeploys, and other branches get preview URLs (previews use `CF_PAGES_URL` automatically for their own links).

`public/_headers` sets security headers and long-term caching for `/img/*` and `/assets/*` on Cloudflare. GitHub Pages ignores that file.

Once Cloudflare is live, either turn off GitHub Pages (Settings → Pages → Source: None) or keep it as a mirror. If you keep it, set `SITE_URL` in the workflow to the custom domain too, so both copies tell search engines the same canonical address.

---

## Custom domain and DNS (when you're ready)

Nothing here is set up yet, and the domain isn't assumed to be purchased.

### With Cloudflare Pages (simplest)

1. Buy the domain (Cloudflare Registrar sells at cost, or use any registrar).
2. If it's registered elsewhere, add the site to Cloudflare (free plan) and change the domain's **nameservers** at the registrar to the two Cloudflare gives you.
3. Pages project → **Custom domains → Set up a custom domain** → `johnbrittain.com`, then again for `www.johnbrittain.com`. Cloudflare creates the DNS records and the HTTPS certificate.
4. Redirect `www` to the bare domain (or the reverse): **Rules → Redirect Rules** → `www.johnbrittain.com/*` → `https://johnbrittain.com/${1}`, 301.
5. Set `SITE_URL=https://johnbrittain.com` in the Pages environment variables and redeploy.

The resulting DNS records look like this:

| Type | Name | Content |
| --- | --- | --- |
| CNAME | `@` | `<project>.pages.dev` (flattened automatically by Cloudflare) |
| CNAME | `www` | `<project>.pages.dev` |

### With GitHub Pages instead

1. Repository → Settings → Pages → **Custom domain** → `johnbrittain.com`, then tick **Enforce HTTPS** once it's available.
2. At your DNS provider:

| Type | Name | Content |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `johnbrittaein.github.io` |

3. In `.github/workflows/deploy-pages.yml`, set `SITE_URL: https://johnbrittain.com` and `BASE_PATH: /`.

### Email on the domain (optional)

If you want `john@johnbrittain.com`, Cloudflare Email Routing (free) can forward it to your existing inbox. It adds its own MX and TXT records. Update `email` in `content/site.js` afterwards.

---

## Before sharing the site widely

- [ ] `showPlaceholders: false` in `content/site.js` (hides every "[ADD …]" slot)
- [ ] Instagram and music-platform URLs filled in (`content/site.js` → `socials`)
- [ ] Homepage `hero` swapped to photographs
- [ ] `npm run build` shows no content warnings
- [ ] `npm run check -- --external` passes
- [ ] Share a project link in a private message to yourself to check the preview image
