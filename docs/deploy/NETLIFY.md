# Deploy to Netlify

Netlify supports Next.js App Router through the official `@netlify/plugin-nextjs` adapter. Note that some Next.js 15 edge features may have minor behavioral differences compared to Vercel. For full compatibility, Vercel is the recommended platform.

---

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free tier works)
- A [Supabase project](https://supabase.com) with your credentials ready
- Your forked repository on GitHub, GitLab, or Bitbucket

---

## Step 1 — Fork the Repository

Go to `https://github.com/your-username/orion-landing-universal` and fork the repository to your own account.

---

## Step 2 — Create a New Netlify Site

1. Log in to [app.netlify.com](https://app.netlify.com) and click **Add new site → Import an existing project**.
2. Connect your Git provider (GitHub, GitLab, or Bitbucket) and authorize Netlify to access your repositories.
3. Select the forked repository from the list.

---

## Step 3 — Configure Build Settings

Netlify should detect the Next.js project automatically. If it does not, set the following manually:

| Setting               | Value        |
| --------------------- | ------------ |
| **Build command**     | `pnpm build` |
| **Publish directory** | `.next`      |
| **Node.js version**   | `20`         |

To pin the Node.js version, you can also create a `.nvmrc` file in the repository root with the content `20`.

> **Note:** Netlify uses the `@netlify/plugin-nextjs` plugin automatically for Next.js projects. You do not need to install it manually.

---

## Step 4 — Configure Environment Variables

Before deploying, go to **Site settings → Environment variables** and add the following:

| Variable                        | Value                                                                | Notes                                                           |
| ------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxxx.supabase.co`                                           | Supabase → Project Settings → API                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...`                                                           | Supabase → Project Settings → API → anon public                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhb...`                                                           | Supabase → Project Settings → API → service_role                |
| `DATABASE_URL`                  | `postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres` | Supabase → Project Settings → Database → URI                    |
| `NEXT_PUBLIC_SITE_URL`          | `https://your-site.netlify.app`                                      | Your Netlify URL — update after deploy if using a custom domain |

Set all variables for the **Production** scope at minimum.

---

## Step 5 — Deploy

Click **Deploy site**. Netlify will:

1. Clone your repository.
2. Install dependencies with pnpm (detected automatically from `pnpm-lock.yaml`).
3. Run `pnpm build`.
4. Deploy the output using the `@netlify/plugin-nextjs` adapter.

The first build typically takes 3–5 minutes.

---

## Step 6 — Run the Setup Wizard

After a successful deploy, navigate to:

```
https://your-site.netlify.app/setup
```

Complete the 5-step wizard to:

1. Verify the Supabase connection.
2. Create the database tables.
3. Insert seed data.
4. Configure your site name and contact information.
5. Create your admin account.

Your landing page will then be live at `https://your-site.netlify.app` and the admin panel at `https://your-site.netlify.app/admin`.

---

## Step 7 (Optional) — Add a Custom Domain

1. Go to **Site settings → Domain management → Add a domain**.
2. Follow the DNS instructions to point your domain to Netlify.
3. Netlify provisions an SSL certificate from Let's Encrypt automatically.
4. Update `NEXT_PUBLIC_SITE_URL` in your environment variables and trigger a redeploy.

---

## Automatic Deployments

Netlify automatically deploys on every push to your production branch (default: `main`). Deploy previews are generated for pull requests automatically.

---

## netlify.toml (Optional)

If you need more control over build settings, create a `netlify.toml` in the repository root:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

This file is optional — Netlify auto-detects Next.js without it.

---

## Troubleshooting

### Build fails with "pnpm: command not found"

Netlify supports pnpm via Corepack. Add this environment variable to your Netlify site:

```
ENABLE_EXPERIMENTAL_COREPACK=1
```

Alternatively, set `NPM_FLAGS=--legacy-peer-deps` if you encounter peer dependency conflicts.

### "next: command not found" during build

This typically means the build ran `npm install` instead of `pnpm install`. Make sure `pnpm-lock.yaml` is committed and not listed in `.gitignore`.

### Environment variables not applied after adding them

`NEXT_PUBLIC_*` variables are embedded at build time. After adding or changing them, trigger a manual redeploy from the Netlify dashboard (**Deploys → Trigger deploy → Deploy site**).

### API routes return 404 after deploy

This usually indicates the `@netlify/plugin-nextjs` adapter is not applied. Verify it appears in the build log under "Installing plugins" or add it manually to `netlify.toml` (see above).

### Setup wizard "Database connection" step fails

- Confirm `DATABASE_URL` is set as a Netlify environment variable (not just in `.env.local` — that file is not read by Netlify).
- The direct PostgreSQL connection requires network access from Netlify's build/function environment to your Supabase database. If Supabase has IP restrictions enabled (not default on free tier), whitelist Netlify's IP ranges or use the manual SQL fallback provided by the wizard.

### Functions timeout during database setup

Netlify Functions have a 10-second default timeout (26 seconds on paid plans). If the DDL step times out, use the manual SQL fallback: copy the generated SQL from the wizard and run it in the Supabase SQL Editor.

---

## Known Limitations on Netlify

- Next.js 15 App Router is supported via `@netlify/plugin-nextjs`, but some very new App Router features may lag behind Vercel's native support.
- `output: 'standalone'` in `next.config.ts` is not compatible with Netlify — the adapter handles output packaging automatically. If you see build errors related to `standalone`, the adapter overrides this setting.
- Long-running server actions or API routes should stay well under 10 seconds (26 seconds on Pro) to avoid function timeouts.

---

## Related

- [Vercel Deployment Guide](VERCEL.md)
- [Docker Deployment Guide](DOCKER.md)
- [VPS Deployment Guide](VPS.md)
- [Back to docs index](../INDEX.md)
