import sharp from 'sharp';
import heicConvert from 'heic-convert';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR, THUMB_DIR } from '../config.js';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);

export function isAllowedExt(ext) {
  return ALLOWED_EXT.has(ext.toLowerCase());
}

// Returns a sharp-compatible input: Buffer for HEIC/HEIF, file path for everything else
async function toSharpInput(tmpPath, originalName) {
  const ext = originalName.split('.').pop().toLowerCase();
  if (ext === 'heic' || ext === 'heif') {
    const inputBuffer = await readFile(tmpPath);
    const jpegBuffer  = await heicConvert({ buffer: inputBuffer, format: 'JPEG', quality: 1 });
    return Buffer.from(jpegBuffer);
  }
  return tmpPath;
}

// orient, convert to JPEG, make a thumbnail — returns the new uuid filename
export async function processPhoto(tmpPath, originalName) {
  const filename = uuidv4() + '.jpg';
  const dst   = join(UPLOAD_DIR, filename);
  const thumb = join(THUMB_DIR, filename);

  const input = await toSharpInput(tmpPath, originalName);
  const img   = sharp(input).rotate(); // .rotate() auto-orients from EXIF

  await img.clone()
    .jpeg({ quality: 92 })
    .toFile(dst);

  await img.clone()
    .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumb);

  return filename;
}
