# Kiroku (記録) — Anime & Manga Tracker Web App

A modern, responsive, full-stack web application for tracking your anime and manga journey. Converted and enhanced from the original Java Swing desktop project `MangaAnimeTracker`.

---

## 🌟 Key Features

- 🔐 **Authentication & User Management**: Multi-user account registration and login with persistent JWT authentication.
- 📊 **Modern Dashboard**:
  - Live statistics: Anime & Manga count, Mean rating score, total episodes/chapters logged.
  - Interactive library share progress bars.
  - Curated anime & manga suggestions with 1-click tracking.
  - Top-rated showcases with visual rank badges and poster art.
- 📚 **Personal Library Manager**:
  - **Grid View** (Poster Art Cards) & **Table View** (Compact data spreadsheet).
  - Quick **`+1` / `-1` progress incrementers** on cards and table rows for instant episode/chapter logging.
  - Instant live search & multi-field sorting (Rating, Title, Progress, Recency).
  - Filter by Media Type (*All, Anime, Manga*) and Status (*Watching/Reading, Plan to Watch/Read, Completed, On Hold, Dropped*).
  - Full edit modal with `EntryRules` validation.
- 🔍 **Live Jikan API (MyAnimeList) Integration**:
  - Real-time search for millions of anime & manga titles.
  - Worldwide top-rated anime and manga charts.
  - Rich details modal with full synopses, scores, genres, and alternative titles.
  - 1-click **"Track Title"** to automatically populate your library with official posters and metadata.
- 💾 **SQLite Database with Automatic Migration**:
  - Uses Node.js native `node:sqlite` for high performance with zero external native build dependencies.
  - Pre-loaded and compatible with existing `kiroku.db` data from the Java desktop app.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js (v22+ / v24+), Express REST API |
| **Database** | SQLite via built-in `node:sqlite` |
| **External API** | Jikan REST API v4 (MyAnimeList) with backend caching |
| **Auth** | JSON Web Tokens (JWT) |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd "C:\Users\Demi Elago\kiroku-web"
npm run install:all
```

### 2. Start Development Servers
Run the backend API and frontend Vite server concurrently:

**Terminal 1 (Backend API on http://localhost:5000):**
```bash
npm run dev:server
```

**Terminal 2 (Frontend on http://localhost:3000):**
```bash
npm run dev:client
```

Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```text
kiroku-web/
├── server/
│   ├── index.js          # Express REST API, auth middleware & Jikan proxy
│   ├── db.js             # SQLite database manager & queries
│   ├── kiroku.db         # Migrated SQLite database file
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Sticky navigation & user session
│   │   │   ├── Dashboard.jsx   # Hero greeting, live stats & top showcases
│   │   │   ├── Library.jsx     # Grid/Table list, filters, search & quick +/-
│   │   │   ├── Discover.jsx    # Jikan search & top rankings
│   │   │   ├── AddModal.jsx    # Create/Edit modal with validation
│   │   │   └── AuthModal.jsx   # Login & Register modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth provider
│   │   ├── services/
│   │   │   └── api.js          # Unified REST API client
│   │   ├── App.jsx             # Main application orchestrator
│   │   ├── index.css           # Custom styles & scrollbars
│   │   └── main.jsx
│   ├── public/                 # Static assets (kiroku.png, icons)
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json
└── package.json                # Root project orchestrator scripts
```
