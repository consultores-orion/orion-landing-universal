# Deploy with Docker

Orion Landing Universal ships with a production-ready Dockerfile and a `docker-compose.yml`. This guide covers local Docker usage and production deployment with nginx and SSL.

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) or Docker Engine + Docker Compose plugin (Linux)
- A [Supabase project](https://supabase.com) with your credentials ready

Verify your installation:

```bash
docker --version        # Docker 24+
docker compose version  # Compose v2+
```

---

## Dockerfile Overview

The project uses a three-stage build to minimize the production image size:

| Stage     | Base Image       | Purpose                                         |
| --------- | ---------------- | ----------------------------------------------- |
| `deps`    | `node:20-alpine` | Install dependencies from `pnpm-lock.yaml`      |
| `builder` | `node:20-alpine` | Run `pnpm build` with Next.js standalone output |
| `runner`  | `node:20-alpine` | Serve the app as a non-root user (`nextjs`)     |

The final image contains only the standalone Next.js output and static files. It exposes port `3000`.

---

## Quick Start (Local)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/orion-landing-universal.git
cd orion-landing-universal
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> The `docker-compose.yml` uses `env_file: .env.local`, so all variables in that file are injected into the container.

### 3. Build and Start the Container

```bash
docker compose up -d
```

The first build will take 3–5 minutes as it installs dependencies and compiles Next.js. Subsequent starts are nearly instant because Docker caches the layers.

### 4. Verify the Container is Running

```bash
docker compose logs -f
```

Look for `✓ Ready in Xms` from Next.js. The healthcheck also verifies `/api/health` every 30 seconds — wait for the status to show `healthy`:

```bash
docker compose ps
# NAME    ... STATUS
# web     ... Up (healthy)
```

### 5. Run the Setup Wizard

Open `http://localhost:3000/setup` in your browser and complete the 5-step configuration.

---

## Stopping and Restarting

```bash
# Stop the container (keeps data)
docker compose down

# Start again
docker compose up -d

# Rebuild after code changes
docker compose up -d --build
```

---

## Production Deployment

For a production server, you will want:

- A reverse proxy (nginx) to handle HTTPS and route traffic to the container.
- An SSL certificate from Let's Encrypt.
- The container to restart automatically on failure.

The `restart: unless-stopped` directive in `docker-compose.yml` ensures the container restarts after crashes or reboots.

### nginx Configuration

Install nginx on your server and create a configuration file for your site:

```nginx
# /etc/nginx/sites-available/orion-landing
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Modern SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Proxy to the Next.js container
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and test the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/orion-landing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will automatically update your nginx configuration to use the certificate and set up auto-renewal.

### Update `NEXT_PUBLIC_SITE_URL`

Update `.env.local` to your production domain:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Then rebuild and restart:

```bash
docker compose up -d --build
```

---

## Environment Variables Reference

| Variable                        | Required | Description                                        |
| ------------------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous key                             |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key (server-side only)       |
| `DATABASE_URL`                  | Yes      | PostgreSQL direct connection URI                   |
| `NEXT_PUBLIC_SITE_URL`          | Yes      | Full URL of your site (used for SEO and redirects) |

---

## Troubleshooting

### Container exits immediately after starting

Check the logs:

```bash
docker compose logs web
```

Common causes:

- Missing or malformed `.env.local` — verify all required variables are present.
- Port `3000` already in use — stop any other service on that port or change the port mapping in `docker-compose.yml` (e.g., `"8080:3000"`).

### Build fails with "ENOENT: no such file or directory, open '/app/.next/standalone/server.js'"

This means the Next.js build did not produce standalone output. Verify that `next.config.ts` contains:

```ts
output: 'standalone'
```

### Container shows "unhealthy" status

The healthcheck calls `GET /api/health`. If the container is unhealthy:

1. Check that the app is responding: `curl http://localhost:3000/api/health`
2. If the app is running but Supabase is unreachable, the health check may still pass (it only checks that the server is alive). The Supabase status is reported in the response body.

### Changes to source code not reflected

The Docker image is built from source at build time. To apply code changes:

```bash
docker compose up -d --build
```

---

## Related

- [Vercel Deployment Guide](VERCEL.md)
- [VPS Deployment Guide](VPS.md)
- [Back to docs index](../INDEX.md)
