# Lekkerkuier — PsyTech Fusion Radio 🌀

**Mzansi's 24/7 PsyTech Fusion Radio** — Broadcasting psytrance, industrial, dark techno, and electronic music to the world.

🌐 **Live at:** [https://lekkerkuier.com](https://lekkerkuier.com)

---

## 📡 Architecture

```
Cloudflare → cloudflared tunnel → Nginx:80/443 → React SPA + AzuraCast proxy
                                              → AzuraCast:8080/8443 (Docker)
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS |
| Routing | react-router-dom v6 (HashRouter) |
| Backend | AzuraCast (Docker) + Nginx reverse proxy |
| Tunnel | Cloudflare (cloudflared) |
| SSL | acme.sh + Let's Encrypt |
| Hosting | Ubuntu 24.04 VPS |

---

## 📄 Pages (17)

| Page | Route | Description |
|------|-------|-------------|
| Home | `#/` | Hero + Now Playing + Featured Shows + Recently Played |
| Schedule | `#/schedule` | 7-day show grid with live indicators |
| DJs | `#/djs` | Resident DJ profiles with bios and shows |
| Events | `#/events` | Featured events with countdown timers + genre filters |
| History | `#/history` | Real-time track history from AzuraCast API |
| Podcast | `#/podcast` | On-demand episode archive with play/download |
| Blog | `#/blog` | News and announcements with category filters |
| Gallery | `#/gallery` | Photo grid with lightbox and keyboard nav |
| Chat | `#/chat` | Live listener chat with song requests |
| About | `#/about` | Station story, timeline, values, FAQ |
| Support | `#/support` | Donation tiers and other ways to help |
| Contact | `#/contact` | Contact form + social links |
| Submit | `#/submit` | Show submission form |
| Login | `#/login` | Operator authentication |
| Admin | `#/admin` | Operator dashboard (auth-gated) |
| Listen | `#/listen` | Alias for Home |

---

## 🧩 Components (15)

| Component | Description |
|-----------|-------------|
| `Header` | Nav + theme picker + language switcher + search trigger |
| `Footer` | 3-column: brand, quick links, social media |
| `Player` | Persistent footer player with Web Audio visualizer |
| `Visualizer` | Real-time frequency bars via AnalyserNode |
| `Hero` | Animated particle canvas with play CTA |
| `NowPlaying` | Current show + live stats display |
| `RecentlyPlayed` | Horizontal scroll track cards |
| `ShowCard` | Reusable card: schedule/featured/compact variants |
| `ErrorBoundary` | React error recovery with reload |
| `Search` | Modal with keyboard nav, 24-indexed results |
| `Toast` | Context-based notifications (success/error/info/warning) |
| `Skeleton` | Shimmer loading states (card/list/grid) |
| `MiniPlayer` | Floating play button when footer hidden |
| `InstallBanner` | PWA install prompt with beforeinstallprompt |
| `VibePicker` | Theme picker (legacy) |

---

## 🎨 Design System

### Themes (3)
- **PsyTech** (default) — Blue/Purple/Mint
- **Cosmic** — Orange/Magenta
- **Industrial** — Cyan/Crimson

Auto-detects OS `prefers-color-scheme` (dark → Industrial, light → Cosmic) unless manually overridden.

### Key CSS Features
- CSS custom variables (`--lk-bg`, `--lk-primary`, etc.)
- Glass morphism (backdrop-blur panels)
- 13 keyframe animations (glow-pulse, float, shimmer, slide-up, etc.)
- Responsive grid layouts
- Custom scrollbar styling

---

## 🌍 i18n

120+ translation keys in English + Afrikaans via lightweight Context API (`I18nProvider`). No external dependencies. Language switcher in header (EN/AF).

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| S | Toggle search |
| H | Go home |
| ? | Shortcut help overlay |
| Esc | Close overlays |

---

## 🔌 API Endpoints (AzuraCast)

| Endpoint | Usage |
|----------|-------|
| `/api/nowplaying` | Current track + song history |
| `/api/LiveStreamStats` | Listener count + bitrate |
| `/api/Show` | Schedule data |
| `/api/DJ` | DJ profiles |
| `/api/contact` | Contact form submissions |
| `/api/chat` | Chat messages |

---

## 🚀 Development

### Prerequisites
- Node.js 18+
- npm 9+

### Setup
```bash
cd src-new
npm install
npm run dev        # Vite dev server on :5173
npm run build      # Production build → public-staging/
```

### Deploy
```bash
npm run build
rm -rf /var/www/lekkerkuier/*
cp -r public-staging/* /var/www/lekkerkuier/
```

### Structure
```
src-new/
├── src/
│   ├── api/         # API client + types
│   ├── auth/        # AuthProvider (operator login)
│   ├── components/  # 15 reusable components
│   ├── i18n/        # I18nProvider (en/af)
│   ├── pages/       # 17 page components
│   ├── theme/       # ThemeProvider + themes
│   ├── App.tsx      # Root component + routes + keyboard shortcuts
│   ├── main.tsx     # Entry point
│   └── index.css    # Complete theme system + all styles
├── public/          # Static assets (PWA manifest, sw.js)
├── index.html       # SEO meta, OG tags, JSON-LD, polyfills
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 🛡️ PWA

- `manifest.json` — standalone display, icons
- `sw.js` — cache-first static assets
- Install banner via `beforeinstallprompt`
- Auto-registration in `main.tsx`

---

## 📊 Performance

- 17 lazy-loaded route chunks (React.lazy + Suspense)
- Shimmer skeleton loading states
- 30s API polling with Page Visibility API pause
- Bundle: ~163KB router + ~50KB app + ~37KB CSS (gzipped ~19KB total)

---

*Made with 💜 in Mzansi. Transcend the Vibration.*
