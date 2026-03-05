import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = join(__dirname, 'uploads');
export const THUMB_DIR  = join(__dirname, 'uploads', 'thumbs');

fs.mkdirSync(UPLOAD_DIR, { recursive: true });
fs.mkdirSync(THUMB_DIR,  { recursive: true });
