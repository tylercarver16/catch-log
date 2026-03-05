# Bass Log

> **Work in progress** — actively being built.

A personal fishing catch logger I built to keep track of where and when I catch fish. Upload a photo, and it pulls GPS coordinates and timestamp straight from the EXIF data, then automatically grabs the weather and location name. Everything gets stored locally in SQLite.

## Stack

- **Backend**: Node.js + Express, better-sqlite3, sharp, exifr, multer
- **Frontend**: React 18, Vite, React Router, React-Leaflet, Bootstrap 5

## Setup

```bash
cd server && npm install
cd ../client && npm install
```

Create `server/.env` if you want a custom port:
```
PORT=5001
```

## Running

Two terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open http://localhost:5173

The Vite dev server proxies `/api` and `/uploads` to Express, so no CORS issues in dev.

## What it does so far

- Upload one or multiple photos per catch
- Pulls GPS + timestamp from EXIF automatically
- Fetches weather from Open-Meteo (no API key required)
- Reverse geocodes location via OpenStreetMap Nominatim
- Edit catch details with an interactive map picker
- Map view showing all GPS-tagged catches
- Bulk import with auto-grouping of photos taken within 60 seconds of each other
- Configurable default species list

## Data

- `server/fishing.db` — SQLite DB, created on first run
- `server/uploads/` — full-size photos
- `server/uploads/thumbs/` — 400×400 thumbnails
