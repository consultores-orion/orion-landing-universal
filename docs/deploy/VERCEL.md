# Deploy to Vercel

Vercel is the recommended deployment platform for Orion Landing Universal. It offers zero-config Next.js support, automatic HTTPS, and global CDN.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier works)
- A [Supabase project](https://supabase.com) (free tier works)
- Your Supabase credentials (URL, Anon Key, Service Role Key, Database URL)

---

## Step 1 — Fork the Repository

Go to `https://github.com/your-username/orion-landing-universal` and click **Fork**. This creates a copy under your GitHub account that you own and can deploy.

---

## Step 2 — Create a New Vercel Project

1. Log in to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Select the forked repository from the list. If you don't see it, click **Adjust GitHub App Permissions** and grant access to the repo.
3. Vercel will detect the Next.js project automatically. Leave the **Build & Output Settings** at their defaults:
   - **Framework Preset**: Next.js
   - **Build Command**: `pnpm build` (or leave blank — Vercel auto-detects)
   - **Output Directory**: `.next`
4. **Do not click Deploy yet** — you must configure environment variables first.

---

## Step 3 — Configure Environment Variables

In the **Environment Variables** section of the new project setup (or later under **Settings → Environment Variables**):

| Variable                        | Value                                                                | Notes                                                                           |
| ------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://xxxx.supabase.co`                                           | Found in Supabase → Project Settings → API                                      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhb...`                                                           | Found in Supabase → Project Settings → API → anon public                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | `eyJhb...`                                                           | Found in Supabase → Project Settings → API → service_role — keep secret         |
| `DATABASE_URL`                  | `postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres` | Found in Supabase → Project Settings → Database → Connection string (URI)       |
| `NEXT_PUBLIC_SITE_URL`          | `https://your-project.vercel.app`                                    | Your Vercel deployment URL — update after first deploy if using a custom domain |

> **Important:** Set all variables for **Production**, **Preview**, and **Development** environments, or at minimum for **Production**.

---

## Step 4 — Deploy

Click **Deploy**. Vercel will:

1. Install dependencies with pnpm.
2. Run `pnpm build`.
3. Deploy the output to its global edge network.

The first build typically takes 2–3 minutes. You will see a live build log.

---

## Step 5 — Run the Setup Wizard

Once deployed, navigate to:

```
https://your-project.vercel.app/setup
```

The 5-step wizard will guide you through:

1. Verifying your Supabase connection.
2. Creating the database tables (runs DDL via direct PostgreSQL connection).
3. Inserting seed data (20 color palettes, default languages, SEO defaults).
4. Configuring your site name, tagline, and contact information.
5. Creating your admin account.

After completing the wizard, your landing page is live at `https://your-project.vercel.app` and the admin panel is at `https://your-project.vercel.app/admin`.

---

## Step 6 (Optional) — Add a Custom Domain

1. In your Vercel project, go to **Settings → Domains**.
2. Add your domain and follow the DNS configuration instructions.
3. After the domain is active, update the `NEXT_PUBLIC_SITE_URL` environment variable to your custom domain and redeploy.

---

## Automatic Deployments

Vercel automatically redeploys your site on every push to the `main` branch of your forked repository. To deploy manually, use the **Redeploy** button in the Vercel dashboard or push a commit.

---

## Troubleshooting

### Build fails with "pnpm: command not found"

Vercel supports pnpm natively. If you see this error, check that your `package.json` does not override the package manager in a conflicting way. You can also add `ENABLE_EXPERIMENTAL_COREPACK=1` as an environment variable in Vercel to enable Corepack.

### Build fails with TypeScript errors

Run `pnpm type-check` locally to reproduce the error. Ensure your local Node.js version matches the Vercel build environment (Node.js 20).

### Environment variables not being picked up

- Variables prefixed with `NEXT_PUBLIC_` are embedded at build time. If you add or change them after a build, you must **redeploy** for them to take effect.
- Variables without the `NEXT_PUBLIC_` prefix are runtime-only and do not require a rebuild.
- Verify the variables are set for the **Production** environment specifically (not just Preview).

### Setup wizard shows "Cannot connect to database"

- Double-check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel's environment settings.
- Ensure `SUPABASE_SERVICE_ROLE_KEY` and `DATABASE_URL` are also set — these are required for the DDL step.
- Check that your Supabase project is not paused (free tier projects pause after 7 days of inactivity).

### "Database URL" step fails but connection test passes

This means `supabase-js` connected successfully but the direct PostgreSQL connection via `DATABASE_URL` failed. In Supabase, the database connection string is under **Project Settings → Database → Connection string → URI**. Make sure you are using the correct password and that the connection pooler is not blocking direct connections.

If direct connections are restricted, the wizard will offer a **manual fallback** — copy the generated SQL and run it in your Supabase project's **SQL Editor**.

---

## Related

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Back to docs index](../INDEX.md)
