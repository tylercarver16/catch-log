import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'fishing.db');

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS catch (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT DEFAULT (datetime('now')),
    photo_taken_at  TEXT,
    timestamp_est   INTEGER DEFAULT 0,
    latitude        REAL,
    longitude       REAL,
    location_name   TEXT,
    photo_filename  TEXT,
    species         TEXT,
    weight          REAL,
    length          REAL,
    lure            TEXT,
    temp            REAL,
    wind_speed      REAL,
    wind_dir        REAL,
    precip          REAL,
    cloud_cover     REAL,
    notes           TEXT
  );

  CREATE TABLE IF NOT EXISTS catch_photo (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    catch_id   INTEGER NOT NULL REFERENCES catch(id) ON DELETE CASCADE,
    filename   TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    id              INTEGER PRIMARY KEY,
    default_species TEXT DEFAULT ''
  );
`);

// migrate: add unit columns if they don't exist yet
try { db.exec("ALTER TABLE settings ADD COLUMN weight_unit TEXT DEFAULT 'lbs'"); } catch {}
try { db.exec("ALTER TABLE settings ADD COLUMN length_unit TEXT DEFAULT 'in'"); } catch {}

// make sure there's always a settings row
const s = db.prepare('SELECT id FROM settings LIMIT 1').get();
if (!s) db.prepare("INSERT INTO settings (id, default_species) VALUES (1, '')").run();

export default db;
