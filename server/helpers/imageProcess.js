import Jimp from 'jimp';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_DIR, THUMB_DIR } from '../config.js';

// no HEIC support in Jimp
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function isAllowedExt(ext) {
  return ALLOWED_EXT.has(ext.toLowerCase());
}

// orient, save as JPEG, make a thumbnail — returns the new uuid filename
export async function processPhoto(tmpPath) {
  const filename = uuidv4() + '.jpg';
  const dst   = join(UPLOAD_DIR, filename);
  const thumb = join(THUMB_DIR, filename);

  // jimp auto-rotates from EXIF on read
  const img = await Jimp.read(tmpPath);

  await img.clone().quality(92).writeAsync(dst);

  await img.clone()
    .scaleToFit(400, 400)   // keeps aspect ratio, max 400x400
    .quality(80)
    .writeAsync(thumb);

  return filename;
}
