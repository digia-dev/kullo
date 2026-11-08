# Deploy checklist & steps: Kullo

Date: 2026-11-08  Commit: none (workspace is not a git repo)  Go from user: **not yet — waiting at the deploy gate**

## Preflight (all must pass)

- [x] e2e suite green: **40/40** (`npm test`)
- [x] no open S1 or S2 bugs (visual pass at 1440 + 390; mobile hero contrast fixed)
- [x] parity: all must-haves done (55/55), feature score **100.0**
- [x] rebrand sweep clean (0 product-scope hits; `replica/sweep-report.txt`)
- [x] production build passes (`npm run build`, 47 routes)
- [x] contrast AA on tokens (0 failures)
- [x] favicon, titles, OG, app icon are Kullo's own (no third-party marks)
- [ ] privacy policy and terms reviewed by the user — pages exist (`/privasi`, `/ketentuan`), content is draft
- [ ] account deletion works end-to-end — member deactivation exists in settings; hard-delete flow not built
- [x] pricing honest: "Hubungi kami", no invented figures
- [x] no fabricated reviews, metrics, or screenshots

## Production (before go-live)

- [ ] separate production database (`DATABASE_PATH` → a file on persistent storage; run `npm run db:setup` once)
- [ ] env vars set (names match `.env.example` — only `DATABASE_PATH` is needed)
- [ ] HTTPS via reverse proxy; session cookie is `secure` in production
- [ ] backups: schedule a copy of the SQLite file (it is a single file — `sqlite3 .backup` or filesystem snapshot)
- [ ] no payment/OAuth/email processors in scope — nothing to configure

## Domain

- [ ] A @ → host IP
- [ ] CNAME www → canonical host (or apex redirect)
- [ ] canonical host chosen, the other 301s
- [ ] HTTPS valid (ACME via proxy)

## Watch

- [ ] error tracking (e.g. Sentry or a log drain)
- [ ] uptime check on `/api/health`
- [ ] analytics (privacy-friendly; no third-party tags currently)
- [ ] core flow F01–F08 done on the live site, desktop and phone

## Deploy steps (node host, recommended)

The app is a standard Next.js server with a file-based SQLite database — it needs a **persistent disk**, so serverless without a volume is not suitable.

```bash
# 1. On the host (Ubuntu/Debian example)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo mkdir -p /var/www/kullo && sudo chown $USER /var/www/kullo

# 2. Ship the code (rsync / git push / CI artifact)
rsync -a --exclude node_modules --exclude .next --exclude data ./ user@host:/var/www/kullo/
ssh user@host
cd /var/www/kullo

# 3. Install, set up database, build
cp .env.example .env          # set DATABASE_PATH=/var/www/kullo/data/kullo.db
npm ci
npm run db:setup              # migrate + seed (skip seed on a real org)
npm run build

# 4. Run under systemd
sudo tee /etc/systemd/system/kullo.service >/dev/null <<'EOF'
[Unit]
Description=Kullo
After=network.target
[Service]
WorkingDirectory=/var/www/kullo
ExecStart=/usr/bin/npx next start -p 3005
Restart=always
Environment=NODE_ENV=production
Environment=DATABASE_PATH=/var/www/kullo/data/kullo.db
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl enable --now kullo

# 5. Reverse proxy (nginx/caddy) :443 → 127.0.0.1:3005, TLS certificate
# 6. Verify
curl -s https://yourdomain/api/health   # {"ok":true,"service":"kullo",...}
npm test                                # run e2e against the live host (set baseURL)
```

### Alternatives

- **Docker**: multi-stage build (`node:22-alpine`, `npm ci && npm run build`), volume-mount `/app/data`, `CMD ["npx","next","start","-p","3005"]`.
- **PaaS with volumes** (Fly.io/Railway/Render): deploy as a Node web service, attach a disk at `DATABASE_PATH`, release command `npm run db:setup`.
- **Vercel**: not suitable as-is — needs a persistent SQLite file (use a hosted Postgres + swap the Drizzle driver instead, which is a code change).

### Rollback

Keep the previous `.next` + `data/kullo.db` copy; restore both and restart the service (schema migrations are forward-only — restore the matching DB snapshot with matching code).
