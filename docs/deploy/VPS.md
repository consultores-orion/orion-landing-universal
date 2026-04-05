# Deploy to a VPS

This guide covers deploying Orion Landing Universal on any Linux VPS or dedicated server. It uses Node.js + PM2 for process management and nginx as a reverse proxy, with SSL via Let's Encrypt.

Tested on: Ubuntu 22.04 LTS / Debian 12.

---

## Prerequisites

- A VPS with root or sudo access
- A domain name pointed at your server's IP (A record)
- A [Supabase project](https://supabase.com) with your credentials ready

---

## Step 1 — Install Node.js 20 and pnpm

```bash
# Install Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version   # v20.x.x
npm --version    # 10.x.x

# Enable pnpm via Corepack
sudo corepack enable
corepack prepare pnpm@latest --activate
pnpm --version   # 10.x.x
```

---

## Step 2 — Install PM2

PM2 is a production process manager for Node.js. It keeps the app running after crashes and restarts it on server reboot.

```bash
sudo npm install -g pm2
pm2 --version
```

---

## Step 3 — Install nginx

```bash
sudo apt-get install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## Step 4 — Clone the Repository

```bash
cd /var/www
sudo git clone https://github.com/your-username/orion-landing-universal.git orion-landing
sudo chown -R $USER:$USER /var/www/orion-landing
cd /var/www/orion-landing
```

---

## Step 5 — Configure Environment Variables

```bash
cp .env.example .env.local
nano .env.local
```

Fill in all required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NODE_ENV=production
```

> **Security:** Restrict access to `.env.local` so only the application user can read it:
>
> ```bash
> chmod 600 .env.local
> ```

---

## Step 6 — Install Dependencies and Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

The build produces a standalone Next.js server in `.next/standalone/`. This is what PM2 will run.

---

## Step 7 — Start the Application with PM2

```bash
# Start the Next.js standalone server
pm2 start .next/standalone/server.js \
  --name "orion-landing" \
  --env production \
  -- --port 3000

# Save the PM2 process list so it survives reboots
pm2 save

# Configure PM2 to start on system boot
pm2 startup
# Follow the on-screen instruction to run the generated sudo command
```

Verify the app is running:

```bash
pm2 status
pm2 logs orion-landing --lines 20
```

You should see `✓ Ready in Xms` in the logs.

---

## Step 8 — Configure nginx as a Reverse Proxy

Create an nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/orion-landing
```

Paste the following (replace `your-domain.com`):

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect HTTP to HTTPS (after SSL is configured)
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL certificates (will be added by certbot)
    # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers (Next.js also sets these; nginx as a belt-and-suspenders layer)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Proxy to Next.js
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

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_read_timeout    60s;
    }

    # Cache Next.js static assets
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/orion-landing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 9 — Enable SSL with Let's Encrypt

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot will:

1. Obtain a certificate for your domains.
2. Automatically update the nginx configuration with SSL settings.
3. Set up a cron job for automatic certificate renewal.

Test the renewal process:

```bash
sudo certbot renew --dry-run
```

---

## Step 10 — Run the Setup Wizard

Navigate to `https://your-domain.com/setup` and complete the 5-step configuration wizard.

---

## Updating the Application

To deploy a new version:

```bash
cd /var/www/orion-landing

# Pull the latest code
git pull origin main

# Install any new dependencies
pnpm install --frozen-lockfile

# Rebuild
pnpm build

# Restart the process (zero downtime within PM2's capabilities)
pm2 restart orion-landing
```

---

## Useful Commands

```bash
# View application logs
pm2 logs orion-landing

# Monitor CPU and memory
pm2 monit

# Restart the app
pm2 restart orion-landing

# Stop the app
pm2 stop orion-landing

# List all PM2 processes
pm2 status

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Check SSL certificate expiry
sudo certbot certificates
```

---

## Security Checklist

- [ ] `.env.local` has `chmod 600` permissions
- [ ] Firewall only exposes ports 22 (SSH), 80 (HTTP), and 443 (HTTPS): `sudo ufw allow 22 && sudo ufw allow 80 && sudo ufw allow 443 && sudo ufw enable`
- [ ] SSH access is key-based (password authentication disabled)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never committed to the repository
- [ ] nginx is serving requests over HTTPS with a valid certificate
- [ ] PM2 startup is configured so the app restarts on server reboot

---

## Troubleshooting

### App is not accessible at port 3000

Check PM2 status and logs:

```bash
pm2 status
pm2 logs orion-landing --lines 50
```

Verify the port is bound:

```bash
ss -tlnp | grep 3000
```

### nginx returns 502 Bad Gateway

The app is not running or is on a different port. Check PM2 status and confirm the `proxy_pass` in nginx points to the correct port (`127.0.0.1:3000`).

### Build fails with "out of memory"

Next.js builds can be memory-intensive on small VPS instances (512 MB RAM). Increase the Node.js heap:

```bash
NODE_OPTIONS="--max-old-space-size=1024" pnpm build
```

Or add it to a `.npmrc` file:

```
node-options=--max-old-space-size=1024
```

### Setup wizard fails at the "Database" step

Ensure `DATABASE_URL` in `.env.local` is the **direct** PostgreSQL connection string (not the pooler URL). In Supabase, go to **Project Settings → Database → Connection string → URI** and use the URI with `?pgbouncer=false` removed.

If network rules block the connection (e.g., Supabase has IP allowlisting enabled), use the manual SQL fallback provided by the wizard: copy the generated SQL and run it in the Supabase SQL Editor.

---

## Related

- [Vercel Deployment Guide](VERCEL.md)
- [Docker Deployment Guide](DOCKER.md)
- [Netlify Deployment Guide](NETLIFY.md)
- [Back to docs index](../INDEX.md)
