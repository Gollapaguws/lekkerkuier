# Lekkerkuier — Project Handoff Document

**Last Updated:** July 22, 2026  
**Live Site:** [https://lekkerkuier.com](https://lekkerkuier.com)

---

## 🖥 Server & Access

| Item | Value |
|------|-------|
| Host | Ubuntu 24.04 VPS |
| Project Root | `/root/lekkerkuier-preserved/` |
| Source Code | `/root/lekkerkuier-preserved/src-new/` |
| Web Root (Production) | `/var/www/lekkerkuier/` |
| Web Root (Staging) | `/var/www/staging/` |
| Build Output | `/root/lekkerkuier-preserved/public-staging/` |
| Backups | `/root/lekkerkuier-backup-YYYYMMDD.tar.gz` |

---

## 🏗 Architecture

```
Cloudflare DNS → cloudflared tunnel → Nginx → React SPA (static files)
                                          → AzuraCast proxy (/api/*, /autodj.mp3)
                                          → AzuraCast Docker (ports 8080/8443)
```

### Key Services

| Service | Config | Status |
|---------|--------|--------|
| Nginx | `/etc/nginx/sites-available/lekkerkuier.com` | Ports 80/443 |
| Nginx Staging | `/etc/nginx/sites-available/staging.lekkerkuier.com` | Same certs |
| AzuraCast | Docker `azuracast` container | Ports 8080/8443 |
| Cloudflared | `systemctl` managed | Tunnel to Cloudflare |
| SSL | acme.sh in `/root/.acme.sh/lekkerkuier.com/` | Auto-renewing |

---

## 🚀 Deploy Process

```bash
# 1. Make changes in /root/lekkerkuier-preserved/src-new/

# 2. Build
cd /root/lekkerkuier-preserved/src-new
npm run build

# 3. Deploy to production
rm -rf /var/www/lekkerkuier/*
cp -r /root/lekkerkuier-preserved/public-staging/* /var/www/lekkerkuier/

# 4. Deploy to staging (optional)
rm -rf /var/www/staging/*
cp -r /root/lekkerkuier-preserved/public-staging/* /var/www/staging/

# 5. Verify
curl -s http://127.0.0.1/ -H "Host: lekkerkuier.com" | grep '<title>'
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `src-new/src/App.tsx` | Root component, routes, keyboard shortcuts |
| `src-new/src/main.tsx` | Entry point, providers (Theme, Auth, I18n, Toast) |
| `src-new/src/index.css` | Complete theme system (608 lines) |
| `src-new/index.html` | SEO meta, OG tags, JSON-LD, PWA meta |
| `src-new/src/api/client.ts` | API client + TypeScript interfaces |
| `src-new/src/i18n/I18nProvider.tsx` | 120+ i18n keys (en/af) |
| `src-new/src/theme/themes.tsx` | 3 themes + auto OS detection |
| `src-new/public/favicon.svg` | Animated waveform favicon |
| `src-new/public/manifest.json` | PWA manifest |
| `src-new/public/sw.js` | Service worker |

---

## 🧩 Project Stats

| Metric | Count |
|--------|-------|
| Pages | 18 |
| Components | 15 |
| Themes | 3 |
| i18n keys | 120+ |
| Source files | 40 |
| CSS lines | 608 |
| Git commits | 3 |

---

## ⏰ Cron Jobs

| Schedule | Job | Purpose |
|----------|-----|---------|
| `0 3 1 * *` | `renew-cert.sh` | SSL certificate renewal |
| `*/5 * * * *` | `radio-healthcheck.sh` | Stream uptime monitoring |
| `*/5 * * * *` | `regen-playlist.sh` | Playlist regeneration |
| `0 3 * * 0` | Backup tarball | Weekly project backup (auto-delete >30d) |

---

## 🔧 Troubleshooting

### Site returns 404
```bash
nginx -t && systemctl reload nginx
systemctl status cloudflared
curl -sk https://127.0.0.1/ -H "Host: lekkerkuier.com" | head -5
```

### AzuraCast not responding
```bash
docker ps | grep azuracast
docker restart azuracast
curl -sk https://127.0.0.1:8443/api/nowplaying -H "Host: lekkerkuier.com"
```

### Cloudflare tunnel down
```bash
systemctl restart cloudflared
journalctl -u cloudflared --no-pager -n 20
```

### SSL cert expired
```bash
/root/.acme.sh/acme.sh --renew -d lekkerkuier.com --force
nginx -t && systemctl reload nginx
```

---

## 📊 Monitoring

- **Uptime:** Cloudflare analytics dashboard
- **Stream health:** `/opt/radio/host-bin/radio-healthcheck.sh` (every 5 min)
- **Disk space:** Currently 45% used (44G/98G)
- **Memory:** 2.6Gi used / 7.8Gi total

---

## 🔐 Notes

- Operator tokens stored in localStorage (`lekkerkuier-token`)
- AzuraCast MySQL: credentials in Docker env
- SSL certs: acme.sh with Let's Encrypt, auto-renew monthly
- Backups: 734MB tarballs, weekly rotation

---

*Handoff prepared for future Lekkerkuier maintainers. Transcend the Vibration.*
