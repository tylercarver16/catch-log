# BiteBook

> **Work in progress** — actively being built.

A personal fishing catch logger. Upload a photo and it pulls GPS coordinates and timestamp straight from the EXIF data, then automatically fetches weather and reverse-geocodes the location. Everything is stored locally in SQLite.

## Stack

- **Backend**: Node.js + Express, `node:sqlite`, sharp, heic-convert, exifr, multer
- **Frontend**: React 18, Vite, React Router, React-Leaflet, Bootstrap 5

## Setup

```bash
# From the project root — installs both server and client dependencies
npm run install:all
```

Create `server/.env` if you want a custom port (defaults to 5001):
```
PORT=5001
```

## Running

Two terminals:

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

Open http://localhost:5173

The Vite dev server proxies `/api` and `/uploads` to Express.

## Features

- Upload one or more photos per catch (JPEG, PNG, WebP, HEIC/HEIF)
- Pulls GPS + timestamp from EXIF automatically
- Fetches historical weather from Open-Meteo (no API key required)
- Reverse geocodes location via OpenStreetMap Nominatim + Overpass (prefers named water bodies)
- Full catch editing with an interactive map picker
- Lure tracking — type, name, and optional advanced fields
- Multiple photos per catch with primary photo selection
- Combine duplicate catches (merges photos under one entry)
- Bulk import with auto-grouping of photos taken within 60 seconds of each other
- Map view with color-coded species markers
- Stats page
- Configurable default species, weight units (lbs/kg), and length units (in/cm)

## Data

- `server/fishing.db` — SQLite database, created on first run
- `server/uploads/` — full-size photos
- `server/uploads/thumbs/` — 400×400 thumbnails
