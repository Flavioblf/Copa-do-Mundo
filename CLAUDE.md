# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Copa do Mundo 2026 Fan Hub — a single-page application (SPA) built with Python (FastAPI) backend and Vanilla JS + CSS frontend. The full PRD lives in `PRD.md`.

## Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

The frontend is static — open `frontend/index.html` directly in a browser, or serve it with:

```bash
cd frontend
python -m http.server 3000
```

Then access `http://localhost:3000`.

> The frontend fetches from `http://localhost:8000/api/*` by default. If the backend URL changes, update `frontend/js/api.js`.

## Architecture

### Backend (Python / FastAPI)

- `backend/main.py` — FastAPI app entry point; mounts all routers
- `backend/routers/` — one file per domain: `matches.py`, `groups.py`, `teams.py`, `history.py`, `bracket.py`
- `backend/services/csv_loader.py` — reads and cleans CSVs with Pandas on startup; results are cached in memory (no DB)
- `backend/data/csv/` — historical CSVs (WorldCups, WorldCupMatches, WorldCupPlayers) sourced from Kaggle
- `backend/data/*.json` — static data files for Copa 2026 (groups, calendar, teams, stadiums); edit these manually when official data changes

**Data flow:** CSV → Pandas (`csv_loader.py`) → in-memory dict → FastAPI router → JSON response → frontend `api.js` fetch → JS module render.

### Frontend (Vanilla JS / CSS)

- `frontend/index.html` — single HTML shell; all page content is rendered dynamically
- `frontend/js/router.js` — hash-based SPA router (`#/grupos`, `#/historico`, etc.)
- `frontend/js/store.js` — lightweight global state (no library); modules read/write here to avoid redundant fetches
- `frontend/js/api.js` — all `fetch()` calls live here; never call `fetch` directly from a module
- `frontend/js/modules/` — one file per page section; each module exports a `render(container)` function
- `frontend/css/variables.css` — single source of truth for all design tokens; never hardcode colors or spacing elsewhere

### Routing convention

Routes map 1:1 to modules: `#/` → `home.js`, `#/grupos` → `groups.js`, `#/calendario` → `calendar.js`, `#/selecoes` → `teams.js`, `#/historico` → `history.js`, `#/chave` → `bracket.js`.

## Design System

All tokens are in `frontend/css/variables.css`. Key values:

| Token | Value | Use |
|---|---|---|
| `--color-bg-primary` | `#0D0F1A` | Page background |
| `--color-bg-secondary` | `#161829` | Cards, panels |
| `--color-gold` | `#C9A84C` | Brand accent, headings |
| `--color-live` | `#E94560` | Live match badge |
| `--color-success` | `#2ECC71` | Qualified teams |
| `--font-display` | Bebas Neue | Scores, hero titles |
| `--font-body` | Inter | All body text |

Breakpoints (mobile-first): `768px` (tablet), `1024px` (desktop), `1440px` (wide).

## Data Sources

**Historical data (CSVs — do not regenerate, edit in place if corrections needed):**
- `WorldCups.csv` — one row per tournament (1930–2022): winner, runner-up, goals, attendance
- `WorldCupMatches.csv` — one row per match with scores and stage
- `WorldCupPlayers.csv` — players per match

**Copa 2026 static data (JSON — update manually as the tournament progresses):**
- `groups_2026.json` — 12 groups × 4 teams
- `calendar_2026.json` — all 104 matches with date (ISO 8601, BRT UTC-3), venue
- `teams_2026.json` — 48 qualified teams with metadata
- `stadiums_2026.json` — 16 venues across USA, Canada, Mexico

## Key Constraints

- **No external API calls in runtime.** All data comes from local CSVs or JSON files.
- **No frontend framework.** Use Vanilla JS modules only; do not introduce React, Vue, or Alpine.
- **No authentication.** The site is fully public; no login, sessions, or user state persisted beyond `sessionStorage`.
- **Language: PT-BR only.** All UI strings, team names, and dates in Brazilian Portuguese. Match times in BRT (UTC-3).
- **WCAG 2.1 AA required.** Every interactive element needs `aria-label`; every image needs `alt`; contrast ratio ≥ 4.5:1.
- **Target Lighthouse score > 85** across all categories. Use SVG for flags, lazy-load off-screen content.
