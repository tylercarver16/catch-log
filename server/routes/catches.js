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
import { markerColor } from '../helpers/species.js';
import { UPLOAD_DIR, THUMB_DIR } from '../config.js';

const router = Router();
const upload = multer({ dest: os.tmpdir() });

function toFloat(v) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function catchToJson(c) {
  const photos = db.prepare(
    'SELECT * FROM catch_photo WHERE catch_id = ? ORDER BY sort_order'
  ).all(c.id);

  let primary = photos.find(p => p.is_primary) || photos[0];
  const primaryFilename = primary?.filename || c.photo_filename || null;

  return {
    ...c,
    timestamp_est: !!c.timestamp_est,
    photos,
    primary_filename: primaryFilename,
  };
}

router.get('/', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM catch ORDER BY photo_taken_at DESC'
  ).all();
  res.json(rows.map(catchToJson));
});

// map view only needs catches that have GPS
router.get('/map', (req, res) => {
  const rows = db.prepare(
    'SELECT * FROM catch WHERE latitude IS NOT NULL'
  ).all();
  res.json(rows.map(c => {
    const full = catchToJson(c);
    return {
      id:      c.id,
      lat:     c.latitude,
      lng:     c.longitude,
      date:    c.photo_taken_at ? new Date(c.photo_taken_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
      temp:    c.temp != null ? Math.round(c.temp) : null,
      species: c.species,
      color:   markerColor(c.species),
      thumb_url: full.primary_filename ? `/uploads/thumbs/${full.primary_filename}` : null,
    };
  }));
});

// single catch
router.get('/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM catch WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(catchToJson(c));
});

// combine multiple catches into one (moves all photos to keepId, deletes the rest)
router.post('/combine', (req, res) => {
  const { keepId, mergeIds } = req.body;
  if (!keepId || !Array.isArray(mergeIds) || mergeIds.length === 0) {
    return res.status(400).json({ error: 'keepId and mergeIds[] required' });
  }

  const keepCatch = db.prepare('SELECT * FROM catch WHERE id = ?').get(keepId);
  if (!keepCatch) return res.status(404).json({ error: 'keepId not found' });
  for (const mid of mergeIds) {
    if (!db.prepare('SELECT id FROM catch WHERE id = ?').get(mid)) {
      return res.status(404).json({ error: `Catch ${mid} not found` });
    }
  }

  const maxSortRow = db.prepare('SELECT MAX(sort_order) as m FROM catch_photo WHERE catch_id = ?').get(keepId);
  let nextSort = (maxSortRow?.m ?? -1) + 1;

  try {
    db.exec('BEGIN');
    for (const mid of mergeIds) {
      const photos = db.prepare('SELECT * FROM catch_photo WHERE catch_id = ?').all(mid);
      for (const photo of photos) {
        db.prepare('UPDATE catch_photo SET catch_id = ?, is_primary = 0, sort_order = ? WHERE id = ?')
          .run(keepId, nextSort++, photo.id);
      }
      db.prepare('DELETE FROM catch WHERE id = ?').run(mid);
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    return res.status(500).json({ error: e.message });
  }

  res.json(catchToJson(db.prepare('SELECT * FROM catch WHERE id = ?').get(keepId)));
});

// create a catch from uploaded photos
router.post('/', upload.array('photos'), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No photos uploaded' });

  const [primaryFile, ...extraFiles] = files;
  const ext = path.extname(primaryFile.originalname).toLowerCase();
  if (!isAllowedExt(ext)) {
    files.forEach(f => fs.unlink(f.path, () => {}));
    return res.status(400).json({ error: `Unsupported file type (${ext})` });
  }

  try {
    const { dt, lat, lng, estimated } = await extractExif(primaryFile.path);
    const filename = await processPhoto(primaryFile.path, primaryFile.originalname);
    const weather  = lat ? await fetchWeather(lat, lng, dt) : null;
    const locName  = lat ? await reverseGeocode(lat, lng) : null;

    const { species, notes, weight, length, lure_type, lure_name } = req.body;

    const info = db.prepare(`
      INSERT INTO catch
        (photo_taken_at, timestamp_est, latitude, longitude, location_name,
         photo_filename, species, weight, length, lure_type, lure_name, notes,
         temp, wind_speed, wind_dir, precip, cloud_cover)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      dt.toISOString(), estimated && lat == null ? 1 : (estimated ? 1 : 0),
      lat, lng, locName, filename,
      species?.trim() || null, toFloat(weight), toFloat(length),
      lure_type?.trim() || null, lure_name?.trim() || null, notes?.trim() || null,
      weather?.temp ?? null, weather?.wind_speed ?? null,
      weather?.wind_dir ?? null, weather?.precip ?? null,
      weather?.cloud_cover ?? null,
    );
    const catchId = info.lastInsertRowid;

    db.prepare('INSERT INTO catch_photo (catch_id, filename, is_primary, sort_order) VALUES (?,?,1,0)')
      .run(catchId, filename);

    for (let i = 0; i < extraFiles.length; i++) {
      const ef = extraFiles[i];
      const eExt = path.extname(ef.originalname).toLowerCase();
      if (!isAllowedExt(eExt)) continue;
      try {
        const efn = await processPhoto(ef.path, ef.originalname);
        db.prepare('INSERT INTO catch_photo (catch_id, filename, is_primary, sort_order) VALUES (?,?,0,?)')
          .run(catchId, efn, i + 1);
      } catch (e) {
        console.warn('Extra photo skipped:', e.message);
      }
    }

    const created = db.prepare('SELECT * FROM catch WHERE id = ?').get(catchId);
    res.status(201).json(catchToJson(created));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    files.forEach(f => fs.unlink(f.path, () => {}));
  }
});

// set primary photo
router.put('/:id/primary-photo', (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ error: 'filename required' });
  const photo = db.prepare('SELECT * FROM catch_photo WHERE catch_id = ? AND filename = ?').get(req.params.id, filename);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });
  db.prepare('UPDATE catch_photo SET is_primary = 0 WHERE catch_id = ?').run(req.params.id);
  db.prepare('UPDATE catch_photo SET is_primary = 1 WHERE id = ?').run(photo.id);
  res.json({ ok: true });
});

// update a catch
router.put('/:id', async (req, res) => {
  const c = db.prepare('SELECT * FROM catch WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });

  const { species, notes, lure_type, lure_name, weight, length,
          photo_taken_at, latitude, longitude,
          refetch_weather, temp, wind_speed, wind_dir, precip, cloud_cover } = req.body;

  const newLat = toFloat(latitude);
  const newLng = toFloat(longitude);
  let locName = c.location_name;
  if (newLat && newLng && (newLat !== c.latitude || newLng !== c.longitude)) {
    locName = await reverseGeocode(newLat, newLng);
  } else if (!newLat || !newLng) {
    locName = null;
  }

  let weatherData = {};
  if (refetch_weather && newLat && photo_taken_at) {
    const dt = new Date(photo_taken_at);
    const w = await fetchWeather(newLat, newLng, dt);
    if (w) weatherData = w;
  } else {
    weatherData = {
      temp:        toFloat(temp),
      wind_speed:  toFloat(wind_speed),
      wind_dir:    toFloat(wind_dir),
      precip:      toFloat(precip),
      cloud_cover: toFloat(cloud_cover),
    };
  }

  db.prepare(`
    UPDATE catch SET
      species=?, notes=?, lure_type=?, lure_name=?, weight=?, length=?,
      photo_taken_at=?, timestamp_est=?,
      latitude=?, longitude=?, location_name=?,
      temp=?, wind_speed=?, wind_dir=?, precip=?, cloud_cover=?
    WHERE id=?
  `).run(
    species?.trim() || null, notes?.trim() || null,
    lure_type?.trim() || null, lure_name?.trim() || null, toFloat(weight), toFloat(length),
    photo_taken_at || c.photo_taken_at,
    (!newLat || !newLng) ? 1 : 0,
    newLat ?? null, newLng ?? null, locName,
    weatherData.temp ?? null, weatherData.wind_speed ?? null,
    weatherData.wind_dir ?? null, weatherData.precip ?? null,
    weatherData.cloud_cover ?? null,
    c.id,
  );

  res.json(catchToJson(db.prepare('SELECT * FROM catch WHERE id = ?').get(c.id)));
});

// delete a single photo from a catch
router.delete('/:id/photos/:photoId', (req, res) => {
  const { id, photoId } = req.params;
  const photo = db.prepare('SELECT * FROM catch_photo WHERE id = ? AND catch_id = ?').get(photoId, id);
  if (!photo) return res.status(404).json({ error: 'Photo not found' });

  [UPLOAD_DIR, THUMB_DIR].forEach(dir => fs.unlink(`${dir}/${photo.filename}`, () => {}));
  db.prepare('DELETE FROM catch_photo WHERE id = ?').run(photo.id);

  if (photo.is_primary) {
    const next = db.prepare('SELECT * FROM catch_photo WHERE catch_id = ? ORDER BY sort_order LIMIT 1').get(id);
    if (next) db.prepare('UPDATE catch_photo SET is_primary = 1 WHERE id = ?').run(next.id);
  }

  const c = db.prepare('SELECT * FROM catch WHERE id = ?').get(id);
  res.json(catchToJson(c));
});

// nuke everything — useful for testing
router.delete('/all', (req, res) => {
  const filenames = [
    ...db.prepare('SELECT filename FROM catch_photo').all().map(p => p.filename),
    ...db.prepare('SELECT photo_filename FROM catch WHERE photo_filename IS NOT NULL').all().map(c => c.photo_filename),
  ];
  filenames.forEach(fn => {
    [UPLOAD_DIR, THUMB_DIR].forEach(dir => fs.unlink(`${dir}/${fn}`, () => {}));
  });
  db.prepare('DELETE FROM catch').run();
  res.json({ ok: true, deleted: filenames.length });
});

// delete one catch and its photos
router.delete('/:id', (req, res) => {
  const c = db.prepare('SELECT * FROM catch WHERE id = ?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });

  const photos = db.prepare('SELECT filename FROM catch_photo WHERE catch_id = ?').all(c.id);
  const filenames = photos.map(p => p.filename);
  if (c.photo_filename && !filenames.includes(c.photo_filename)) filenames.push(c.photo_filename);

  filenames.forEach(fn => {
    [UPLOAD_DIR, THUMB_DIR].forEach(dir => {
      fs.unlink(`${dir}/${fn}`, () => {});
    });
  });

  db.prepare('DELETE FROM catch WHERE id = ?').run(c.id);
  res.json({ ok: true });
});

export default router;
