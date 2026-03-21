import exifr from 'exifr';
import { readFile } from 'fs/promises';

// pulls datetime and GPS out of image EXIF, returns { dt, lat, lng, estimated }
export async function extractExif(filepath) {
  try {
    // Read the full buffer — chunked reading can miss GPS data in HEIC/HEIF containers
    // where the EXIF block may be located beyond the default read window
    const buf = await readFile(filepath);
    const data = await exifr.parse(buf, { gps: true });

    if (!data) return { dt: new Date(), lat: null, lng: null, estimated: true };

    // timestamp
    let dt = data.DateTimeOriginal || data.DateTimeDigitized || data.DateTime || null;
    const estimated = !dt;
    if (!dt) dt = new Date();
    else if (!(dt instanceof Date)) dt = new Date(dt);

    // gps:true makes exifr put decimal coords in data.latitude / data.longitude
    let lat = null, lng = null;
    if (data.latitude != null && data.longitude != null) {
      const rawLat = Number(data.latitude.toFixed(6));
      const rawLng = Number(data.longitude.toFixed(6));
      if (rawLat !== 0 || rawLng !== 0) {
        lat = rawLat;
        lng = rawLng;
      }
    }

    return { dt, lat, lng, estimated };
  } catch {
    return { dt: new Date(), lat: null, lng: null, estimated: true };
  }
}
