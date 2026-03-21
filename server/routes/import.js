import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import path from 'path';
import db from '../db.js';
import { extractExif } from '../helpers/exif.js';
import { fetchWeather } from '../helpers/weather.js';
import { reverseGeocode } from '../helpers/geocode.js';
import { processPhoto, isAllowedExt } from '../helpers/imageProcess.js';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

// Process up to N async tasks concurrently
const CONCURRENCY = 4;
async function runConcurrent(items, fn) {
  if (!items.length) return [];
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
}

router.post('/', upload.array('photos'), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No files selected' });

  const { species, notes } = req.body;
  const results = [];

  // Separate valid from invalid files up front
  const validFiles   = [];
  const invalidFiles = [];
  for (const f of files) {
    const ext = path.extname(f.originalname).toLowerCase();
    if (isAllowedExt(ext)) {
      validFiles.push(f);
    } else {
      invalidFiles.push(f);
      results.push({ name: f.originalname, extra_names: [], success: false, error: `Unsupported type (${ext})`, catch: null });
      fs.unlink(f.path, () => {});
    }
  }

  // Phase 1: extract EXIF from all valid files in parallel
  const pending = await runConcurrent(validFiles, async (f) => {
    const { dt, lat, lng, estimated } = await extractExif(f.path);
    return { name: f.originalname, tmp: f.path, dt, lat, lng, estimated };
  });

  // Sort by timestamp then group photos taken within 60s of each other
  pending.sort((a, b) => (a.dt || 0) - (b.dt || 0));
  const groups = [];
  for (const fi of pending) {
    let placed = false;
    if (!fi.estimated) {
      for (let g = groups.length - 1; g >= 0; g--) {
        if (!groups[g][0].estimated &&
            Math.abs(groups[g][0].dt - fi.dt) / 1000 <= 60) {
          groups[g].push(fi);
          placed = true;
          break;
        }
      }
    }
    if (!placed) groups.push([fi]);
  }

  // Phase 2: process each group concurrently — photo conversion + weather + geocode + DB write
  const groupResults = await runConcurrent(groups, async (group) => {
    const primary = group[0];
    const extras  = group.slice(1);
    try {
      const [filename, weather, locName] = await Promise.all([
        processPhoto(primary.tmp, primary.name),
        primary.lat ? fetchWeather(primary.lat, primary.lng, primary.dt) : Promise.resolve(null),
        primary.lat ? reverseGeocode(primary.lat, primary.lng)           : Promise.resolve(null),
      ]);

      const info = db.prepare(`
        INSERT INTO catch
          (photo_taken_at, timestamp_est, latitude, longitude, location_name,
           photo_filename, species, notes,
           temp, wind_speed, wind_dir, precip, cloud_cover)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
      `).run(
        primary.dt.toISOString(),
        primary.estimated && primary.lat == null ? 1 : (primary.estimated ? 1 : 0),
        primary.lat, primary.lng, locName, filename,
        species?.trim() || null, notes?.trim() || null,
        weather?.temp ?? null, weather?.wind_speed ?? null,
        weather?.wind_dir ?? null, weather?.precip ?? null,
        weather?.cloud_cover ?? null,
      );
      const catchId = info.lastInsertRowid;

      db.prepare('INSERT INTO catch_photo (catch_id, filename, is_primary, sort_order) VALUES (?,?,1,0)')
        .run(catchId, filename);

      for (let i = 0; i < extras.length; i++) {
        try {
          const efn = await processPhoto(extras[i].tmp, extras[i].name);
          db.prepare('INSERT INTO catch_photo (catch_id, filename, is_primary, sort_order) VALUES (?,?,0,?)')
            .run(catchId, efn, i + 1);
        } catch {}
      }

      const created = db.prepare('SELECT * FROM catch WHERE id = ?').get(catchId);
      return {
        name:        primary.name,
        extra_names: extras.map(e => e.name),
        success:     true,
        error:       null,
        catch: { id: created.id, photo_taken_at: created.photo_taken_at, location_name: created.location_name, temp: created.temp },
      };
    } catch (e) {
      return {
        name:        primary.name,
        extra_names: extras.map(e => e.name),
        success:     false,
        error:       e.message,
        catch:       null,
      };
    } finally {
      group.forEach(fi => fs.unlink(fi.tmp, () => {}));
    }
  });

  results.push(...groupResults);

  res.json({
    saved:   results.filter(r => r.success).length,
    total:   files.length,
    results,
  });
});

export default router;
